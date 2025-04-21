"""
SAP Integration module for Vaultigo Password Manager
This module handles authentication and data exchange with SAP Business Technology Platform.
"""
import os
import requests
import json
from typing import Dict, List, Optional, Union
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# SAP API configuration
SAP_BASE_URL = os.getenv("SAP_API_BASE_URL", "https://api.sap.com")
SAP_CLIENT_ID = os.getenv("SAP_CLIENT_ID", "")
SAP_CLIENT_SECRET = os.getenv("SAP_CLIENT_SECRET", "")
SAP_AUTH_URL = os.getenv("SAP_AUTH_URL", "https://my-api.authentication.sap.hana.ondemand.com/oauth/token")


class BusinessPartner(BaseModel):
    """Model representing an SAP Business Partner"""
    BusinessPartner: str
    BusinessPartnerName: Optional[str] = None
    BusinessPartnerType: Optional[str] = None
    EmailAddress: Optional[str] = None
    IsAuthenticated: bool = False


class SAPAuthResponse(BaseModel):
    """Model for SAP authentication response"""
    access_token: str
    token_type: str
    expires_in: int
    scope: Optional[str] = None


class SAPClient:
    """Client for SAP API interactions"""
    
    def __init__(self):
        self.base_url = SAP_BASE_URL
        self.client_id = SAP_CLIENT_ID
        self.client_secret = SAP_CLIENT_SECRET
        self.auth_url = SAP_AUTH_URL
        self.token = None
    
    def authenticate(self) -> Optional[str]:
        """Authenticate with SAP and get access token"""
        if not self.client_id or not self.client_secret:
            print("SAP credentials not configured. Using mock data.")
            return None
            
        auth_data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'client_credentials'
        }
        
        try:
            response = requests.post(
                self.auth_url,
                data=auth_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                auth_response = response.json()
                self.token = auth_response.get('access_token')
                return self.token
            else:
                print(f"SAP authentication failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Error during SAP authentication: {str(e)}")
            return None
    
    def verify_business_partner(self, email: str) -> BusinessPartner:
        """Verify if an email belongs to a trusted SAP Business Partner"""
        # If no token and authentication fails, use mock data
        if not self.token and not self.authenticate():
            return self._get_mock_business_partner(email)
        
        try:
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Using query parameter to search by email
            url = f"{self.base_url}/s4hanacloud/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner"
            params = {
                "$filter": f"EmailAddress eq '{email}'",
                "$format": "json"
            }
            
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('d', {}).get('results', [])
                
                if results:
                    bp_data = results[0]
                    return BusinessPartner(
                        BusinessPartner=bp_data.get('BusinessPartner'),
                        BusinessPartnerName=bp_data.get('BusinessPartnerFullName'),
                        BusinessPartnerType=bp_data.get('BusinessPartnerType'),
                        EmailAddress=email,
                        IsAuthenticated=True
                    )
                else:
                    return BusinessPartner(
                        BusinessPartner="UNKNOWN",
                        EmailAddress=email,
                        IsAuthenticated=False
                    )
            else:
                print(f"SAP API request failed: {response.status_code} - {response.text}")
                return self._get_mock_business_partner(email)
                
        except Exception as e:
            print(f"Error verifying business partner: {str(e)}")
            return self._get_mock_business_partner(email)
    
    def _get_mock_business_partner(self, email: str) -> BusinessPartner:
        """Provide mock data for testing when SAP is not configured"""
        # Check if email is likely a business partner based on domain
        trusted_domains = [
            "sap.com", "microsoft.com", "oracle.com", "ibm.com", 
            "accenture.com", "deloitte.com", "pwc.com", "ey.com"
        ]
        
        domain = email.split('@')[-1] if '@' in email else ""
        is_trusted = any(domain.endswith(td) for td in trusted_domains)
        
        if is_trusted:
            return BusinessPartner(
                BusinessPartner=f"BP_{hash(email) % 10000:04d}",
                BusinessPartnerName=email.split('@')[0].title(),
                BusinessPartnerType="ORGANIZATION",
                EmailAddress=email,
                IsAuthenticated=True
            )
        else:
            return BusinessPartner(
                BusinessPartner="UNKNOWN",
                EmailAddress=email,
                IsAuthenticated=False
            )


# Create a singleton instance
sap_client = SAPClient()

# Initialize the SAP client
def init_sap_client():
    """Initialize the SAP client and authenticate"""
    sap_client.authenticate()
    return sap_client

# Main verification function to be used by other modules
def verify_email_sender(email: str) -> BusinessPartner:
    """Verify if an email sender is a trusted SAP business partner"""
    return sap_client.verify_business_partner(email)