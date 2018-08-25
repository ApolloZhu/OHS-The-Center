"""
To run this program, make sure you have python installed,
then open cmd, PowerShell, or Terminal, type in:

pip install beautifulsoup4 requests xlwt
python fetch_teacher_info.py

You'll find the files in the OUTPUT_DIRECTORY specified below.
"""

# If disable filter, either False or True
# MUST Capitalize the first letter:
FETCH_ALL_STAFF = False

# Name of the file to save data to:
# Do NOT remove the quotation marks.
FILE_NAME = "OHS Teachers"  # automatically appends current year later
POSITIONS_FILE_NAME = "Included and Excluded Positions"
OUTPUT_DIRECTORY = "generated"  # use "" for current folder

# This program extract all teachers with position
# containing the word "Teacher"
# but you can specify it to:

# Don't include these teachers
NOT_TO_INCLUDE = [
    "Substitute Teacher",
    # Example: "Non-existent Teacher",
    # Add Below

    # Add Above
]

# Include these positions that don't contain the word "Teacher":
ADDITIONALLY_INCLUDE = [
    "Instructional Assistant",
    # Example: "School Counselor",
    # Add Below

    # Add Above
]

######################################
# UNLESS YOU KNOW WHAT YOU ARE DOING #
# DON NOT TOUCH THE CODE BELOW!      #
######################################

def extractRole(position):
    """
    This function trims a teacher's position
    and returns the essential role.

    Note: I still don't quite understand why we have
    middle school teacher in Oakton High.
    """
    return position \
        .replace(", High School", "") \
        .replace(", HS", "") \
        .replace(", MS/HS", "") \
        .replace(", MS", "") \
        .split("-")[0].strip()

import datetime, os, re
from bs4 import BeautifulSoup
from requests import get
from xlwt import Workbook

if len(OUTPUT_DIRECTORY) > 0 and not OUTPUT_DIRECTORY.isspace():
    if not os.path.exists(OUTPUT_DIRECTORY):
        os.mkdir(OUTPUT_DIRECTORY)
    os.chdir(OUTPUT_DIRECTORY)

included = set()
excluded = set()
wb = Workbook()
ws = wb.add_sheet("Sheet1")

wsR = 0
# Write a line
def wsWriteLine(*arg):
    global wsR
    for c in range(len(arg)):
        ws.write(wsR, c, arg[c])
    wsR += 1


def fetchNumPages():
    r = get("https://oaktonhs.fcps.edu/staff-directory")
    soup = BeautifulSoup(r.text, "html.parser")
    header = list(soup.find_all('h2')[-1].stripped_strings)[0]
    m = re.search('(?<=out of )\d+', header)
    return int((int(m.group(0)) - 1) / 10)


print("Processing...")
wsWriteLine("Last Name", "First Name", "Role", "Email")  # Header
for i in range(fetchNumPages() + 1):
    r = get("https://oaktonhs.fcps.edu/staff-directory?&page=" + str(i))
    soup = BeautifulSoup(r.text, "html.parser")
    for row in soup.tbody.find_all("tr"):
        cells = list(row.find_all("td"))
        names = list(cells[0].stripped_strings)
        last = names[0]
        first = names[-1]
        position = str(list(cells[1].stripped_strings)[0])
        role = extractRole(position)
        email = cells[2].a.contents[0]
        # Filter
        if FETCH_ALL_STAFF \
            or (role not in NOT_TO_INCLUDE
                and (role in ADDITIONALLY_INCLUDE
                     or "Teacher" in role)):
            wsWriteLine(last, first, role, email)
            included.add(role)
        else:
            excluded.add(role)

# Save teachers list
now = datetime.date.today()
year = now.year
if now.month < 7: year -= 1
FILE_NAME = FILE_NAME + " " + str(year) + "-" + str(year + 1) + ".xls"
wb.save(FILE_NAME)
print("Saved: " + os.path.join(os.getcwd(), FILE_NAME))

# Custom comparator that pops positions not ended with "Teacher"
def make_cmp(teachers_last=True):
    def __cmp(a, b):
        l = "Teacher" in a
        r = "Teacher" in b
        if l != r:  # IFF only one of the two contains "Teacher"
            if teachers_last:
                return l and 1 or -1  # The one without "Teacher" is smaller
            else:
                return r and 1 or -1  # The one with "Teacher" is smaller
        else:  # Normal cmp implementation
            if (a == b): return 0
            if (a < b): return -1
            if (a > b): return 1
    return __cmp


# Save positions list
from functools import cmp_to_key
POSITIONS_FILE_NAME = POSITIONS_FILE_NAME + ".txt"
with open(POSITIONS_FILE_NAME, 'w') as f:
    f.write("Included:\n\n")
    for position in sorted(included, key=cmp_to_key(make_cmp())):
        f.write(position + "\n")

    f.write("\n\n\nExcluded:\n\n")
    for position in sorted(excluded, key=cmp_to_key(make_cmp(False))):
        f.write(position + "\n")
print("Saved: " + os.path.join(os.getcwd(), POSITIONS_FILE_NAME))

print("Done")
