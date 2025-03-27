import requests
from bs4 import BeautifulSoup
import json
import os

def scrape_car_loan_data():
    print("Starting car loan scraper...")
    url = "https://www.bankbazaar.com/car-loan.html"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        print("Successfully retrieved webpage")
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Scrape car loan details
        loan_data = []
        table = soup.find("table", {"data-testid": "table-"})
        if table:
            print("Found loan details table")
            rows = table.find_all("tr")[1:]  # Skip header row
            for row in rows:
                columns = row.find_all("td")
                if len(columns) >= 3:
                    loan_data.append({
                        "Bank Name": columns[0].text.strip(),
                        "Interest Rate (p.a.)": columns[1].text.strip(),
                        "Processing Fee": columns[2].text.strip()
                    })
                    print(f"Added data for bank: {columns[0].text.strip()}")
        else:
            print("No loan details table found")
        
        # Eligibility Criteria
        eligibility_criteria = [
            "Age: 18 years and above (maximum age: 75 years).",
            "Minimum net income: ₹20,000 per month.",
            "At least one year of employment with the current employer."
        ]
        
        # Save data to JSON
        data = {
            "Car Loan Details": loan_data,
            "Eligibility Criteria": eligibility_criteria
        }
        
        # Get the absolute path for the output file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_file = os.path.join(current_dir, "car_loan_data.json")
        
        # Save to JSON file
        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)
        print(f"Data successfully saved to {output_file}")
        
    except requests.RequestException as e:
        print(f"Error retrieving webpage: {e}")
    except Exception as e:
        print(f"Error during scraping: {e}")

if __name__ == "__main__":
    scrape_car_loan_data()
