const processScrapedData = (scrapedData, loanType = 'homeLoan') => {
  console.log(`Processing ${loanType} data without OpenAI...`);
  console.log('Input data structure:', Object.keys(scrapedData));
  
  switch (loanType) {
    case 'educationLoan':
      return processEducationLoanData(scrapedData);
    case 'personalLoan':
      return processPersonalLoanData(scrapedData);
    case 'carLoan':
      return processCarLoanData(scrapedData);
    case 'homeLoan':
    default:
      return processHomeLoanData(scrapedData);
  }
};

// Process home loan data
const processHomeLoanData = (scrapedData) => {
  const processedData = [];
  
  // Process general tables for bank information
  if (scrapedData.general_tables && Array.isArray(scrapedData.general_tables)) {
    scrapedData.general_tables.forEach(table => {
      if (table.headers && table.rows) {
        // Try to identify bank information tables
        const headerStr = table.headers.join(' ').toLowerCase();
        if (headerStr.includes('bank') || headerStr.includes('lender') || 
            headerStr.includes('interest') || headerStr.includes('loan')) {
          
          // Map headers to expected fields
          const headerMap = {};
          table.headers.forEach((header, index) => {
            const h = header.toLowerCase();
            if (h.includes('bank') || h.includes('lender')) headerMap.bankName = index;
            if (h.includes('interest') || h.includes('rate')) headerMap.interestRate = index;
            if (h.includes('processing') || h.includes('fee')) headerMap.processingFee = index;
            if (h.includes('tenure') || h.includes('term')) headerMap.tenure = index;
            if (h.includes('amount') || h.includes('loan')) headerMap.loanAmount = index;
          });
          
          // Extract data from rows
          table.rows.forEach(row => {
            // Skip empty rows
            if (row.every(cell => !cell || cell.trim() === '')) return;
            
            // Extract bank name (required)
            const bankName = headerMap.bankName !== undefined ? row[headerMap.bankName] : 'Unknown Bank';
            if (!bankName || bankName.trim() === '') return;
            
            // Extract interest rate
            let interestRate = 8.5; // Default
            if (headerMap.interestRate !== undefined) {
              const rateStr = row[headerMap.interestRate];
              if (rateStr) {
                // Try to parse interest rate (handle formats like "8.5%" or "8.5 to 9.5%")
                const rateMatch = rateStr.match(/(\d+\.\d+)/);
                if (rateMatch) interestRate = parseFloat(rateMatch[1]);
              }
            }
            
            // Extract processing fee
            const processingFee = headerMap.processingFee !== undefined ? 
              row[headerMap.processingFee] : 'Not specified';
            
            // Extract tenure information
            let minTenure = 12, maxTenure = 360; // Defaults
            if (headerMap.tenure !== undefined) {
              const tenureStr = row[headerMap.tenure];
              if (tenureStr) {
                const tenureMatch = tenureStr.match(/(\d+)\s*(?:to|-)?\s*(\d+)/);
                if (tenureMatch) {
                  minTenure = parseInt(tenureMatch[1]);
                  maxTenure = parseInt(tenureMatch[2] || tenureMatch[1]);
                } else {
                  const singleTenure = parseInt(tenureStr.match(/(\d+)/)?.[1]);
                  if (singleTenure) {
                    minTenure = maxTenure = singleTenure;
                  }
                }
              }
            }
            
            // Extract loan amount information
            let minLoanAmount = 500000, maxLoanAmount = 10000000; // Defaults
            if (headerMap.loanAmount !== undefined) {
              const amountStr = row[headerMap.loanAmount];
              if (amountStr) {
                // Handle formats like "5 Lakh to 10 Crore" or "Up to 10 Crore"
                if (amountStr.toLowerCase().includes('lakh')) {
                  const lakhMatch = amountStr.match(/(\d+(?:\.\d+)?)\s*lakh/i);
                  if (lakhMatch) {
                    minLoanAmount = parseFloat(lakhMatch[1]) * 100000;
                  }
                }
                if (amountStr.toLowerCase().includes('crore')) {
                  const croreMatch = amountStr.match(/(\d+(?:\.\d+)?)\s*crore/i);
                  if (croreMatch) {
                    maxLoanAmount = parseFloat(croreMatch[1]) * 10000000;
                  }
                }
              }
            }
            
            // Create bank data object
            const bankData = {
              bankName: bankName.trim(),
              loanType: 'Home Loan',
              interestRate,
              minTenure,
              maxTenure,
              minLoanAmount,
              maxLoanAmount,
              processingFee: processingFee || 'Not specified',
              eligibilityCriteria: extractEligibilityCriteria(scrapedData),
              documents: extractDocuments(scrapedData),
              sourceUrl: 'https://www.bankbazaar.com/home-loan.html'
            };
            
            processedData.push(bankData);
          });
        }
      }
    });
  }
  
  // Extract eligibility criteria from bullet points
  function extractEligibilityCriteria(data) {
    const defaultCriteria = ['Age 21-65', 'Minimum income of ₹25,000 per month'];
    
    if (data.bullet_points) {
      for (const [title, points] of Object.entries(data.bullet_points)) {
        if (title.toLowerCase().includes('eligibility') && Array.isArray(points) && points.length > 0) {
          return points.map(p => p.trim()).filter(p => p);
        }
      }
    }
    
    if (data.home_loan_eligibility && data.home_loan_eligibility.rows) {
      const criteria = [];
      data.home_loan_eligibility.rows.forEach(row => {
        if (row.length >= 2) {
          criteria.push(`${row[0]}: ${row[1]}`);
        }
      });
      if (criteria.length > 0) return criteria;
    }
    
    return defaultCriteria;
  }
  
  // Extract required documents from bullet points
  function extractDocuments(data) {
    const defaultDocs = ['ID Proof', 'Address Proof', 'Income Proof'];
    
    if (data.bullet_points) {
      for (const [title, points] of Object.entries(data.bullet_points)) {
        if ((title.toLowerCase().includes('document') || title.toLowerCase().includes('required')) 
            && Array.isArray(points) && points.length > 0) {
          return points.map(p => p.trim()).filter(p => p);
        }
      }
    }
    
    return defaultDocs;
  }
  
  // If no data was extracted, return sample data
  if (processedData.length === 0) {
    console.log('No data extracted from scraped content, using sample data');
    return [
      {
        bankName: 'HDFC Bank',
        loanType: 'Home Loan',
        interestRate: 8.5,
        minTenure: 12,
        maxTenure: 360,
        minLoanAmount: 500000,
        maxLoanAmount: 10000000,
        processingFee: '1% of loan amount',
        eligibilityCriteria: ['Age 21-65', 'Minimum income of ₹25,000 per month'],
        documents: ['ID Proof', 'Address Proof', 'Income Proof'],
        sourceUrl: 'https://www.bankbazaar.com/home-loan.html'
      },
      {
        bankName: 'SBI',
        loanType: 'Home Loan',
        interestRate: 8.75,
        minTenure: 12,
        maxTenure: 360,
        minLoanAmount: 500000,
        maxLoanAmount: 15000000,
        processingFee: '0.5% of loan amount',
        eligibilityCriteria: ['Age 21-70', 'Minimum income of ₹20,000 per month'],
        documents: ['ID Proof', 'Address Proof', 'Income Proof', 'Property Documents'],
        sourceUrl: 'https://www.bankbazaar.com/home-loan.html'
      }
    ];
  }
  
  console.log(`Extracted ${processedData.length} bank records from scraped data`);
  return processedData;
};

// Process education loan data
const processEducationLoanData = (scrapedData) => {
  const processedData = [];
  
  // Process loan details
  if (scrapedData['Loan Details'] && Array.isArray(scrapedData['Loan Details'])) {
    scrapedData['Loan Details'].forEach(loan => {
      processedData.push({
        bankName: loan['Bank Name'] || 'Unknown Bank',
        loanType: 'Education Loan',
        interestRate: parseFloat(loan['Interest Rate (p.a.)']) || 9.0,
        minTenure: 12,
        maxTenure: parseInt(loan['Tenure']) || 84,
        minLoanAmount: 100000,
        maxLoanAmount: 5000000,
        processingFee: 'Varies by bank',
        eligibilityCriteria: scrapedData['Eligibility Criteria'] || [
          'Must be enrolled in a recognized institution',
          'Age 18-35 years',
          'Co-applicant (parent/guardian) required'
        ],
        documents: [
          'ID Proof',
          'Address Proof',
          'Income Proof of Co-applicant',
          'Admission Letter',
          'Mark Sheets of Previous Education'
        ],
        sourceUrl: 'https://www.bankbazaar.com/education-loan.html'
      });
    });
  }
  
  // If no data was extracted, return sample data
  if (processedData.length === 0) {
    console.log('No education loan data extracted, using sample data');
    return [
      {
        bankName: 'SBI',
        loanType: 'Education Loan',
        interestRate: 8.85,
        minTenure: 12,
        maxTenure: 180,
        minLoanAmount: 100000,
        maxLoanAmount: 7500000,
        processingFee: 'Nil',
        eligibilityCriteria: [
          'Indian Nationals',
          'Secured admission to professional/technical courses',
          'Secured admission through entrance test/selection process'
        ],
        documents: [
          'Completed application form',
          'Passport size photographs',
          'Proof of identity/address/age',
          'Proof of admission',
          'Schedule of expenses'
        ],
        sourceUrl: 'https://www.bankbazaar.com/education-loan.html'
      }
    ];
  }
  
  console.log(`Extracted ${processedData.length} education loan records`);
  return processedData;
};

// Process personal loan data
const processPersonalLoanData = (scrapedData) => {
  const processedData = [];
  
  if (Array.isArray(scrapedData)) {
    scrapedData.forEach(loan => {
      // Extract interest rate
      let interestRate = 12.0; // Default
      if (loan['Interest Rate']) {
        const rateMatch = loan['Interest Rate'].match(/(\d+(?:\.\d+)?)/);
        if (rateMatch) {
          interestRate = parseFloat(rateMatch[1]);
        }
      }
      
      // Extract tenure
      let minTenure = 12, maxTenure = 60; // Defaults
      if (loan['Tenure']) {
        const tenureMatch = loan['Tenure'].match(/(\d+)\s*(?:to|-)?\s*(\d+)/);
        if (tenureMatch) {
          minTenure = parseInt(tenureMatch[1]);
          maxTenure = parseInt(tenureMatch[2] || tenureMatch[1]);
        }
      }
      
      // Extract loan amount
      let minLoanAmount = 50000, maxLoanAmount = 1000000; // Defaults
      if (loan['Loan Amount']) {
        const amountMatch = loan['Loan Amount'].match(/(\d+(?:\.\d+)?)\s*(?:to|-)?\s*(\d+(?:\.\d+)?)/);
        if (amountMatch) {
          minLoanAmount = parseFloat(amountMatch[1]) * (loan['Loan Amount'].toLowerCase().includes('lakh') ? 100000 : 1);
          maxLoanAmount = parseFloat(amountMatch[2] || amountMatch[1]) * (loan['Loan Amount'].toLowerCase().includes('lakh') ? 100000 : 1);
        }
      }
      
      processedData.push({
        bankName: loan['Bank Name'] || 'Unknown Bank',
        loanType: 'Personal Loan',
        interestRate,
        minTenure,
        maxTenure,
        minLoanAmount,
        maxLoanAmount,
        processingFee: loan['Processing Fee'] || 'Varies by bank',
        eligibilityCriteria: loan['Eligibility Criteria'] || [
          'Age 21-60 years',
          'Minimum income of ₹15,000 per month',
          'Minimum 1 year of work experience'
        ],
        documents: loan['Required Documents'] || [
          'ID Proof',
          'Address Proof',
          'Income Proof',
          'Bank Statements'
        ],
        sourceUrl: 'https://www.bankbazaar.com/personal-loan.html'
      });
    });
  }
  
  // If no data was extracted, return sample data
  if (processedData.length === 0) {
    console.log('No personal loan data extracted, using sample data');
    return [
      {
        bankName: 'HDFC Bank',
        loanType: 'Personal Loan',
        interestRate: 10.75,
        minTenure: 12,
        maxTenure: 60,
        minLoanAmount: 50000,
        maxLoanAmount: 4000000,
        processingFee: 'Up to 2.5% of loan amount',
        eligibilityCriteria: [
          'Age 21-60 years',
          'Minimum income of ₹25,000 per month',
          'Salaried individuals with at least 2 years of work experience'
        ],
        documents: [
          'ID Proof',
          'Address Proof',
          'Income Proof',
          'Bank Statements for last 3 months'
        ],
        sourceUrl: 'https://www.bankbazaar.com/personal-loan.html'
      }
    ];
  }
  
  console.log(`Extracted ${processedData.length} personal loan records`);
  return processedData;
};

// Process car loan data
const processCarLoanData = (scrapedData) => {
  const processedData = [];
  
  // Process car loan details
  if (scrapedData['Car Loan Details'] && Array.isArray(scrapedData['Car Loan Details'])) {
    scrapedData['Car Loan Details'].forEach(loan => {
      processedData.push({
        bankName: loan['Bank Name'] || 'Unknown Bank',
        loanType: 'Car Loan',
        interestRate: parseFloat(loan['Interest Rate (p.a.)']) || 9.5,
        minTenure: 12,
        maxTenure: 84,
        minLoanAmount: 100000,
        maxLoanAmount: 10000000,
        processingFee: 'Up to 1% of loan amount',
        eligibilityCriteria: scrapedData['Eligibility Criteria'] || [
          'Age 18-75 years',
          'Minimum income of ₹20,000 per month',
          'At least one year of employment with current employer'
        ],
        documents: [
          'ID Proof',
          'Address Proof',
          'Income Proof',
          'Bank Statements',
          'Vehicle quotation'
        ],
        sourceUrl: 'https://www.bankbazaar.com/car-loan.html'
      });
    });
  }
  
  // If no data was extracted, return sample data
  if (processedData.length === 0) {
    console.log('No car loan data extracted, using sample data');
    return [
      {
        bankName: 'HDFC Bank',
        loanType: 'Car Loan',
        interestRate: 9.25,
        minTenure: 12,
        maxTenure: 84,
        minLoanAmount: 100000,
        maxLoanAmount: 10000000,
        processingFee: '0.5% of loan amount',
        eligibilityCriteria: [
          'Age 21-65 years',
          'Minimum income of ₹25,000 per month',
          'Stable employment history'
        ],
        documents: [
          'ID Proof',
          'Address Proof',
          'Income Proof',
          'Bank Statements',
          'Vehicle quotation'
        ],
        sourceUrl: 'https://www.bankbazaar.com/car-loan.html'
      }
    ];
  }
  
  console.log(`Extracted ${processedData.length} car loan records`);
  return processedData;
};

module.exports = {
  processScrapedData
}; 