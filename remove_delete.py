import re
with open('D:/Desktop/opay/admin-app/js/trash.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'document\.querySelectorAll\("\.delete-perm-btn"\)\.forEach\(.*?\n      \}\);\n', '', content, flags=re.DOTALL)
content = re.sub(r'document\s*\.getElementById\("emptyTrashBtn"\)\s*\.addEventListener\(.*?\n    \}\);\n', '', content, flags=re.DOTALL)

with open('D:/Desktop/opay/admin-app/js/trash.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('D:/Desktop/opay/admin-app/pages/trash.html', 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = re.sub(r'<button\s+id="emptyTrashBtn".*?</button>', '', content2, flags=re.DOTALL)

with open('D:/Desktop/opay/admin-app/pages/trash.html', 'w', encoding='utf-8') as f:
    f.write(content2)
