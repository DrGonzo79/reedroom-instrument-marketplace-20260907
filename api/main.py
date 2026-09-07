import json
import os
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="Reedroom API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
catalog = json.loads((Path(__file__).resolve().parent.parent / "data/instruments.json").read_text())


@app.get("/health")
def health():
    return {"status": "ok", "mode": "demo"}


@app.get("/instruments")
def instruments(q: str = Query(default="", max_length=100), family: str = "All"):
    return [
        instrument for instrument in catalog
        if (family == "All" or instrument["family"] == family)
        and q.casefold() in f'{instrument["name"]} {instrument["artist"]} {instrument["character"]}'.casefold()
    ]


class RoyaltyScenario(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    price_cents: int = Field(ge=0, le=1000000)
    units: int = Field(ge=0, le=1000000)
    artist_percent: int = Field(ge=0, le=100)


@app.post("/royalties/estimate")
def estimate(scenario: RoyaltyScenario):
    gross_cents = scenario.price_cents * scenario.units
    artist_cents = gross_cents * scenario.artist_percent // 100
    return {"grossCents": gross_cents, "artistCents": artist_cents, "platformCents": gross_cents - artist_cents}
