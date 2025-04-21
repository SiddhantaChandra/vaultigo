from typing import Union, List
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from levelone_check import emailpayload, levelone_check
from sap_integration import get_sap_client, SAPApiClient, SAPBusinessPartner

app = FastAPI(title="Enhanced Security App with SAP Integration")

@app.get("/")
def root():
    return {"message": "Welcome to the enhanced security application with SAP integration"}

@app.post("/check/")
def start_email_check(payload: emailpayload):
    return levelone_check(payload)

# SAP Integration endpoints
@app.get("/sap/business-partners/", response_model=List[SAPBusinessPartner])
def get_business_partners(filter_query: str = None):
    """
    Get business partners from SAP
    Optional filter query parameter in OData format
    Example: EmailAddress eq 'example@company.com'
    """
    try:
        sap_client = get_sap_client()
        return sap_client.get_business_partners(filter_query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SAP API error: {str(e)}")

@app.get("/sap/verify-sender/{email}")
def verify_sender(email: str):
    """Verify if an email sender is a trusted SAP business partner"""
    try:
        sap_client = get_sap_client()
        return sap_client.check_business_partner_status(email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SAP API error: {str(e)}")

class TrustStatus(BaseModel):
    email: str
    is_trusted: bool

@app.post("/sap/bulk-verify/", response_model=List[TrustStatus])
def bulk_verify_senders(emails: List[str]):
    """Verify multiple email senders at once"""
    try:
        sap_client = get_sap_client()
        results = []
        for email in emails:
            check = sap_client.check_business_partner_status(email)
            results.append(TrustStatus(
                email=email,
                is_trusted=check.get("is_business_partner", False)
            ))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SAP API error: {str(e)}")