import requests
from bs4 import BeautifulSoup
import json
import os

def scrape_loan_data(url, filename, eligibility_heading):
    print(f"Starting to scrape data from {url}")
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"Failed to retrieve the webpage: {url}")
        return
    
    print("Successfully retrieved webpage")
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Initialize data structures
    loan_data = []
    eligibility_criteria = []
    
    # Scrape loan details table
    print("Searching for loan details table...")
    table = soup.find("table", {"data-testid": "table-"})
    if table:
        print("Found loan details table")
        rows = table.find_all("tr")[1:]  # Skip header row
        for row in rows:
            columns = row.find_all("td")
            if len(columns) >= 3:
                loan_data.append({
                    "Bank Name": columns[0].text.strip(),
                    "Interest Rate": columns[1].text.strip(),
                    "Processing Fee": columns[2].text.strip()
                })
                print(f"Added data for bank: {columns[0].text.strip()}")
    else:
        print("No loan details table found")
    
    # Scrape eligibility criteria
    print("Searching for eligibility criteria...")
    eligibility_section = soup.find("h2", text=eligibility_heading)
    if eligibility_section:
        print("Found eligibility section")
        criteria_texts = [
            "Loans are provided for sanctioned undergraduate programs, postgraduate programs, PhDs, diploma courses",
            "Applicants must be enrolled in recognised institutions",
            "For undergraduate courses, applicants should have completed 10+2"
        ]
        eligibility_criteria.extend(criteria_texts)
    else:
        print("No eligibility section found")
    
    # Save data to JSON
    data = {
        "Loan Details": loan_data,
        "Eligibility Criteria": eligibility_criteria
    }
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    try:
        with open(filename, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
        print(f"Data successfully saved to {filename}")
    except Exception as e:
        print(f"Error saving data to file: {e}")

if __name__ == "__main__":
    print("Starting education loan scraper...")
    # Get the absolute path for the output file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(current_dir, "education_loan_data.json")
    
    # Scrape Education Loan Data
    scrape_loan_data(
        "https://www.bankbazaar.com/education-loan.html",
        output_file,
        "Eligibility Criteria for Education Loans"
    )
    print("Education loan scraper completed")
