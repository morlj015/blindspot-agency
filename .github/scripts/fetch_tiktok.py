#!/usr/bin/env python3
"""Fetches the public follower count for @e.v.adesignandbuild on TikTok
and writes it to data/eva-stats.json. If the fetch fails, the existing
value is preserved so the site never shows a blank or wrong count."""

import json
import os
import re
import sys
from datetime import date

import requests

HANDLE = "e.v.adesignandbuild"
STATS_FILE = "data/eva-stats.json"


def fetch_followers() -> int | None:
    url = f"https://www.tiktok.com/@{HANDLE}"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://www.google.com/",
    }
    try:
        r = requests.get(url, headers=headers, timeout=20)
        r.raise_for_status()
        m = re.search(r'"followerCount"\s*:\s*(\d+)', r.text)
        if m:
            return int(m.group(1))
        print("followerCount pattern not found in TikTok response", file=sys.stderr)
    except Exception as exc:
        print(f"Request failed: {exc}", file=sys.stderr)
    return None


def main():
    os.makedirs("data", exist_ok=True)

    current = {"followers": 1954, "updated": str(date.today())}
    if os.path.exists(STATS_FILE):
        with open(STATS_FILE) as f:
            current = json.load(f)

    count = fetch_followers()
    if count and count > 0:
        print(f"Fetched {count} followers")
        current["followers"] = count
        current["updated"] = str(date.today())
    else:
        print(f"Fetch failed — keeping existing count: {current['followers']}")

    with open(STATS_FILE, "w") as f:
        json.dump(current, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
