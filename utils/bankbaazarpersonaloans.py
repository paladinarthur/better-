from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import json
import os

def scrape_personal_loans():
    print("Starting personal loans scraper...")
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # Initialize the Chrome driver
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        print("Chrome driver initialized successfully")
        
        # Open BankBazaar loan page
        url = "https://www.bankbazaar.com/personal-loan.html"
        driver.get(url)
        print(f"Navigated to {url}")
        
        # Wait for the content to load
        time.sleep(5)
        
        # Parse the page content
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Extract loan information
        loans_data = []
        loan_cards = soup.find_all("div", class_="loan-card")
        
        print(f"Found {len(loan_cards)} loan cards")
        
        for card in loan_cards:
            try:
                bank_name = card.find("h3", class_="bank-name").text.strip()
                interest_rate = card.find("div", class_="interest-rate").text.strip()
                loan_amount = card.find("div", class_="loan-amount").text.strip()
                
                loans_data.append({
                    "Bank Name": bank_name,
                    "Interest Rate": interest_rate,
                    "Loan Amount": loan_amount,
                    "Loan Type": "Personal Loan"
                })
                print(f"Added data for {bank_name}")
                
            except Exception as e:
                print(f"Error extracting data from card: {e}")
        
        # Save to JSON file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_file = os.path.join(current_dir, "loans_data.json")
        
        with open(output_file, "w", encoding="utf-8") as file:
            json.dump(loans_data, file, indent=4, ensure_ascii=False)
        print(f"Data saved to {output_file}")
        
    except Exception as e:
        print(f"Error during scraping: {e}")
    
    finally:
        try:
            driver.quit()
            print("Chrome driver closed successfully")
        except:
            pass

if __name__ == "__main__":
    scrape_personal_loans()

