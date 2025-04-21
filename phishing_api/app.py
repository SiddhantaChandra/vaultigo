from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from levelone_check import *
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  
        "http://127.0.0.1:3000"   
    ],
    allow_credentials=True,
    allow_methods=["*"],         
    allow_headers=["*"],
)

@app.get("/")
def root():
    return({"message":"welcome to root"})

@app.post("/check/")
def startemailcheck(payload:emailpayload):
    return levelone_check(payload)


