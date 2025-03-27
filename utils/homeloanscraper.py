from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import time
import os

# Setup Chrome options for headless browsing
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run without opening browser
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Use WebDriver Manager to handle ChromeDriver installation
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# Open the webpage
url = "https://www.bankbazaar.com/home-loan.html"
driver.get(url)

# Scroll down slowly to trigger lazy loading
scroll_pause_time = 2  # Adjust if needed
scroll_height = driver.execute_script("return document.body.scrollHeight")

for i in range(3):  # Scroll multiple times to ensure full page load
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(scroll_pause_time)  # Wait for new content to load

# Wait for tables to load (Max wait: 15 sec)
try:
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'ui celled striped structured table')]"))
    )
except Exception as e:
    print("Error: Table not found after waiting:", e)

# Parse the page source with BeautifulSoup
soup = BeautifulSoup(driver.page_source, "html.parser")
driver.quit()

extracted_data = {}

### **Debugging: Print Available Elements Before Extracting**
print(" Checking available elements on page:")
tables_found = soup.find_all("table", class_="ui celled striped structured table")
print(f" Found {len(tables_found)} tables!")

if len(tables_found) == 0:
    print(" No tables found. Check if they are inside an iframe or require more scrolling.")

### **Extract Tables Properly**
table_data = []
for table in tables_found:
    headers = [th.text.strip() for th in table.find_all("th")]
    rows = []
    for row in table.find_all("tr")[1:]:  # Skip header row
        cols = [col.text.strip() for col in row.find_all(["td", "th"])]
        rows.append(cols)

    if headers and rows:
        table_data.append({"headers": headers, "rows": rows})

extracted_data["general_tables"] = table_data

### **Extract Bullet Points**
bullet_data = {}
for section in soup.find_all("ul", class_="ui list"):
    section_title = section.find_previous("h2")  # Get the heading before the list
    title = section_title.text.strip() if section_title else "Miscellaneous"
    bullet_points = [li.text.strip() for li in section.find_all("li")]

    if bullet_points:
        bullet_data[title] = bullet_points  # Store categorized bullet points

extracted_data["bullet_points"] = bullet_data

### **Extract Home Loan Eligibility Table**
eligibility_section = soup.find("h2", id="home_loan_eligi_6")
if eligibility_section:
    eligibility_table = eligibility_section.find_next("table", class_="ui celled striped structured table")
    if eligibility_table:
        headers = [th.text.strip() for th in eligibility_table.find_all("th")]
        rows = []
        for row in eligibility_table.find_all("tr")[1:]:
            cols = [col.text.strip() for col in row.find_all(["td", "th"])]
            rows.append(cols)

        extracted_data["home_loan_eligibility"] = {"headers": headers, "rows": rows}

### **Extract Table Inside `<div class="hfm-table">`**
hfm_table_div = soup.find("div", class_="hfm-table")
if hfm_table_div:
    hfm_table = hfm_table_div.find("table", class_="ui celled striped structured table")
    if hfm_table:
        headers = [th.text.strip() for th in hfm_table.find_all("th")]
        rows = []
        for row in hfm_table.find_all("tr")[1:]:
            cols = [col.text.strip() for col in row.find_all(["td", "th"])]
            rows.append(cols)

        extracted_data["hfm_table"] = {"headers": headers, "rows": rows}

### **Extract specific sections by their headings**
sections = {}
for heading in soup.find_all(['h1', 'h2', 'h3']):
    heading_text = heading.text.strip()
    if any(keyword in heading_text.lower() for keyword in ['eligibility', 'document', 'feature', 'benefit']):
        section_content = []
        for sibling in heading.find_next_siblings():
            if sibling.name in ['h1', 'h2', 'h3']:
                break
            if sibling.name == 'ul':
                for li in sibling.find_all('li'):
                    section_content.append(li.text.strip())
            elif sibling.name == 'p':
                section_content.append(sibling.text.strip())
        
        if section_content:
            sections[heading_text] = section_content

extracted_data["sections"] = sections

### **Extract FAQ sections**
faqs = []
faq_section = soup.find('h2', string=lambda text: text and 'faq' in text.lower())
if faq_section:
    for sibling in faq_section.find_next_siblings():
        if sibling.name in ['h1', 'h2', 'h3']:
            break
        
        # Look for question-answer pairs
        if sibling.name == 'div' and 'faq' in sibling.get('class', ''):
            questions = sibling.find_all('div', class_='question')
            answers = sibling.find_all('div', class_='answer')
            
            for q, a in zip(questions, answers):
                faqs.append({
                    'question': q.text.strip(),
                    'answer': a.text.strip()
                })

extracted_data["faqs"] = faqs

### **Save Extracted Data to JSON**
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraped_data.json")
with open(output_path, "w", encoding="utf-8") as file:
    json.dump(extracted_data, file, indent=4, ensure_ascii=False)

print(" Data extraction complete! Check scraped_data.json")
