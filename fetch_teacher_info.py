# The index of the last page of staffs.
LAST_PAGE = 27

# If disable filter, either False or True
# MUST Capitalize the first letter:
FETCH_ALL_STAFF = False

# Name of the file to save data to:
# Do NOT remove the quotation marks.
FILE_NAME = "OHS Teachers"  # automatically appends current year later
POSITIONS_FILE_NAME = "Included and Excluded Positions"
OUTPUT_DIRECTORY = "generated"  # use "" for current folder

# This program extract all teachers with position
# ended with the word "Teacher", but you can specify

# Don't include these teachers
NOT_TO_INCLUDE = [
    "Substitute Teacher",
    # Example: "Non-existent Teacher",
    # Add Below

    # Add Above
]

# Included these positions that don't end with the word "Teacher":
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

import datetime
from bs4 import BeautifulSoup
import os
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


wsWriteLine("Teacher", "Role", "Email")  # Header
for i in range(LAST_PAGE + 1):
    r = get("https://oaktonhs.fcps.edu/staff-directory?&page=" + str(i))
    soup = BeautifulSoup(r.text, "html.parser")
    for row in soup.tbody.find_all("tr"):
        cells = list(row.find_all("td"))
        name = "".join(list(cells[1].strings)).strip()
        position = list(cells[2].stripped_strings)[0]
        email = cells[3].a.contents[0]
        # Filter
        if FETCH_ALL_STAFF \
            or (position not in NOT_TO_INCLUDE
                and (position in ADDITIONALLY_INCLUDE
                     or position.endswith("Teacher"))):
            wsWriteLine(name, position, email)
            included.add(position)
        else:
            excluded.add(position)

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
        l = a.endswith("Teacher")
        r = b.endswith("Teacher")
        if l != r:  # IFF only one of the two ends with "Teacher"
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
