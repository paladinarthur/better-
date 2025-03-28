import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchLoansByType = async (loanType: string) => {
  try {
    console.log(`Fetching loans for type: ${loanType}`);
    const response = await axios.get(`${API_BASE_URL}/banks/type/${loanType}`);
    console.log('Response:', response.data);
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch loans');
  } catch (error) {
    console.error('Error fetching loans:', error);
    throw error;
  }
};

export const triggerScraper = async (loanType: string) => {
  try {
    console.log(`Triggering scraper for: ${loanType}`);
    const response = await axios.post(`${API_BASE_URL}/banks/trigger-scraper/${loanType}`);
    
    if (response.data.success) {
      return response.data.message;
    }
    throw new Error(response.data.error || 'Failed to trigger scraper');
  } catch (error) {
    console.error('Error triggering scraper:', error);
    throw error;
  }
}; 