from typing import Union
from pydantic import BaseModel
from enum import Enum
from localmodel import givephiprob
from sap_integration import get_sap_client, SAPApiClient

import json

class emailpayload(BaseModel):
    emailbody: str
    emailsender: str

class threatlevel(Enum):
    good = "good"
    sus = "sus"
    bad = "bad"

class checkstatus(BaseModel):
    status: threatlevel
    suswords: list[str]
    is_trusted_partner: bool = False
    partner_info: dict = None

def levelone_check(data: emailpayload):
    emailid = data.emailsender
    emailbody = data.emailbody.split(" ")
    suswordjson = json.load(open("suswords.json", "r"))
    suswords = suswordjson["words"]
    wordsfound = []
    for word in emailbody:
        if word in suswords:
            print("found sus word")
            wordsfound.append(word)

    suswordscount = len(wordsfound)
    prob = givephiprob([data.emailbody])
    
    # Check if the sender is a trusted SAP business partner
    try:
        sap_client = get_sap_client()
        partner_check = sap_client.check_business_partner_status(data.emailsender)
        is_trusted = partner_check.get("is_business_partner", False)
        partner_info = partner_check.get("partner_info", None)
        
        # Adjust threat probability if sender is a trusted business partner
        if is_trusted:
            # Reduce probability by 25% if sender is a trusted partner
            prob = max(0, prob - 0.25)
    except Exception as e:
        print(f"SAP API check failed: {str(e)}")
        is_trusted = False
        partner_info = None

    if(prob > 0.7):
        return checkstatus(
            status=threatlevel.sus,
            suswords=wordsfound,
            is_trusted_partner=is_trusted,
            partner_info=partner_info
        )
    elif(prob > 0.5):
        return checkstatus(
            status=threatlevel.bad,
            suswords=wordsfound,
            is_trusted_partner=is_trusted,
            partner_info=partner_info
        )
    else:
        return checkstatus(
            status=threatlevel.good,
            suswords=wordsfound,
            is_trusted_partner=is_trusted,
            partner_info=partner_info
        )