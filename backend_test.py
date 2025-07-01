import requests
import unittest
import json
import sys
from datetime import datetime

class CricketFantasyAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "testpass123"
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            201,
            data=self.test_user
        )
        return success

    def test_login(self):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
        )
        if success and 'user' in response:
            print(f"Logged in as: {response['user'].get('name', 'Unknown')}")
            return True
        return False

    def test_get_matches(self):
        """Test getting matches"""
        success, response = self.run_test(
            "Get Matches",
            "GET",
            "matches",
            200
        )
        if success and 'matches' in response:
            print(f"Retrieved {len(response['matches'])} matches")
            return True
        return False

    def test_get_players(self):
        """Test getting players"""
        success, response = self.run_test(
            "Get Players",
            "GET",
            "players",
            200
        )
        if success and 'players' in response:
            print(f"Retrieved {len(response['players'])} players")
            return True
        return False

    def test_get_players_with_filter(self):
        """Test getting players with filter"""
        success, response = self.run_test(
            "Get Players with Filter (Batsman)",
            "GET",
            "players",
            200,
            params={"role": "Batsman"}
        )
        if success and 'players' in response:
            print(f"Retrieved {len(response['players'])} batsmen")
            return True
        return False

    def test_get_teams(self):
        """Test getting teams"""
        success, response = self.run_test(
            "Get Teams",
            "GET",
            "teams",
            200
        )
        if success and 'teams' in response:
            print(f"Retrieved {len(response['teams'])} teams")
            return True
        return False

    def test_get_contests(self):
        """Test getting contests"""
        success, response = self.run_test(
            "Get Contests",
            "GET",
            "contests",
            200
        )
        if success and 'contests' in response:
            print(f"Retrieved {len(response['contests'])} contests")
            return True
        return False

    def test_get_leaderboard(self):
        """Test getting leaderboard"""
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        if success and 'leaderboard' in response:
            print(f"Retrieved {len(response['leaderboard'])} leaderboard entries")
            return True
        return False

def main():
    # Setup
    tester = CricketFantasyAPITester("http://localhost:3001")
    
    # Run tests
    print("\n===== CRICKET FANTASY LEAGUE API TESTS =====\n")
    
    # Authentication Tests
    print("\n----- Authentication Tests -----")
    registration_success = tester.test_register()
    if registration_success:
        login_success = tester.test_login()
    else:
        print("❌ Registration failed, skipping login test")
        login_success = False
    
    # Data Retrieval Tests
    print("\n----- Data Retrieval Tests -----")
    matches_success = tester.test_get_matches()
    players_success = tester.test_get_players()
    players_filter_success = tester.test_get_players_with_filter()
    teams_success = tester.test_get_teams()
    contests_success = tester.test_get_contests()
    leaderboard_success = tester.test_get_leaderboard()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Return success status
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())