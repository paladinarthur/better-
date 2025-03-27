const OpenAI = require('openai');
const BankModel = require('../models/BankModel');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Process raw loan data with OpenAI to enhance and structure it
 * @param {Object} rawLoanData - The raw loan data from scraper
 * @returns {Object} - Enhanced bank model data
 */
const generateBankModel = async (rawLoanData) => {
  try {
    console.log(`Generating structured data for ${rawLoanData.bankName}`);
    
    const prompt = `
      I have raw loan data from a bank that I need structured in a specific format.
      
      Raw data:
      ${JSON.stringify(rawLoanData, null, 2)}
      
      Please convert this into a structured format with the following fields:
      - bankName: The name of the bank
      - loanType: The type of loan (e.g., Home Loan, Personal Loan)
      - interestRate: The interest rate (can be a range with min and max)
      - minTenure: Minimum loan tenure in months
      - maxTenure: Maximum loan tenure in months
      - minLoanAmount: Minimum loan amount
      - maxLoanAmount: Maximum loan amount
      - processingFee: Processing fee details
      - eligibilityCriteria: Array of eligibility criteria
      - requiredDocuments: Array of required documents
      - benefits: Array of benefits
      - specialFeatures: Array of special features
      - sourceUrl: URL where the data was scraped from
      
      Return only the JSON object without any additional text.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that structures loan data into a consistent format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    // Parse the response from OpenAI
    const structuredData = JSON.parse(response.choices[0].message.content.trim());
    
    return structuredData;
  } catch (error) {
    console.error('Error generating bank model:', error);
    throw error;
  }
};

/**
 * Generate advice for a loan application using OpenAI
 * @param {Object} application - The loan application data
 * @returns {String} - AI-generated advice
 */
const generateApplicationAdvice = async (application) => {
  try {
    const prompt = `
      I need advice for a loan application with the following details:
      
      Application:
      ${JSON.stringify(application, null, 2)}
      
      Please provide personalized advice on:
      1. The likelihood of approval based on the provided information
      2. Suggestions to improve the application
      3. Alternative loan options if this one isn't suitable
      4. Tips for managing the loan if approved
      
      Format the response as a JSON object with these sections.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a financial advisor specializing in loan applications." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });
    
    // Parse the response from OpenAI
    const advice = JSON.parse(response.choices[0].message.content.trim());
    
    return advice;
  } catch (error) {
    console.error('Error generating application advice:', error);
    throw error;
  }
};

module.exports = {
  generateBankModel,
  generateApplicationAdvice
}; 