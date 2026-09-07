from fastapi.testclient import TestClient
import pytest

from main import app

client = TestClient(app)


def test_catalog_filters_by_family_and_search():
    response = client.get("/instruments", params={"family": "Keys", "q": "harmonium"})
    assert response.status_code == 200
    instruments = response.json()
    assert len(instruments) == 1
    assert instruments[0]["name"] == "The Parlour Harmonium"


def test_royalty_estimate_conserves_cents():
    response = client.post("/royalties/estimate", json={"price_cents": 4900, "units": 100, "artist_percent": 60})
    assert response.status_code == 200
    assert response.json() == {"grossCents": 490000, "artistCents": 294000, "platformCents": 196000}


@pytest.mark.parametrize("field,value", [("units", -1), ("artist_percent", 101), ("price_cents", 1.5), ("units", True), ("price_cents", 1000001)])
def test_invalid_scenarios_are_rejected(field, value):
    scenario = {"price_cents": 4900, "units": 100, "artist_percent": 60}
    scenario[field] = value
    assert client.post("/royalties/estimate", json=scenario).status_code == 422


@pytest.mark.parametrize("share", [0, 33, 60, 100])
def test_rounding_never_loses_money(share):
    result = client.post("/royalties/estimate", json={"price_cents": 101, "units": 1, "artist_percent": share}).json()
    assert result["artistCents"] + result["platformCents"] == 101
    assert result["artistCents"] == 101 * share // 100


def test_zero_sales_and_empty_search():
    result = client.post("/royalties/estimate", json={"price_cents": 4900, "units": 0, "artist_percent": 60}).json()
    assert result == {"grossCents": 0, "artistCents": 0, "platformCents": 0}
    assert client.get("/instruments?q=not-an-instrument").json() == []
    assert client.get("/health").json() == {"status": "ok", "mode": "demo"}
