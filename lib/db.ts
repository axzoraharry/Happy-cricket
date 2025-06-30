import { neon } from "@neondatabase/serverless"

// Global mock database that persists across module reloads
declare global {
  var mockDatabase: {
    users: any[]
    matches: any[]
    teams: any[]
    contests: any[]
    players: any[]
    nextId: number
  } | undefined
}

// Initialize mock database with sample data
if (!global.mockDatabase) {
  global.mockDatabase = {
    users: [],
    matches: [
      {
        id: 1,
        team_a: "India",
        team_b: "Australia", 
        venue: "Melbourne Cricket Ground",
        match_date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        match_type: "T20",
        status: "upcoming"
      },
      {
        id: 2,
        team_a: "England",
        team_b: "South Africa",
        venue: "Lord's Cricket Ground", 
        match_date: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
        match_type: "ODI",
        status: "upcoming"
      }
    ],
    teams: [
      { id: 1, name: "Super Kings", total_points: 450, rank: 2 },
      { id: 2, name: "Royal Challengers", total_points: 380, rank: 5 }
    ],
    contests: [
      {
        id: 1,
        name: "IPL Mega Contest",
        entry_fee: 100,
        total_teams: 10000,
        prize_pool: 1000000,
        joined_teams: 8500,
        status: "upcoming",
        start_time: new Date(Date.now() + 86400000).toISOString()
      }
    ],
    players: [
      { id: 1, name: "Virat Kohli", team: "India", role: "Batsman", points: 850 },
      { id: 2, name: "Jasprit Bumrah", team: "India", role: "Bowler", points: 720 },
      { id: 3, name: "Steve Smith", team: "Australia", role: "Batsman", points: 780 }
    ],
    nextId: 1
  }
}

const mockDatabase = global.mockDatabase

// Mock SQL template function
const mockSql = (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.join('?').toLowerCase()
  console.log('Mock SQL Query:', query, 'Values:', values)
  
  // User operations
  if (query.includes('insert into users')) {
    const [name, email, password_hash] = values
    const newUser = {
      id: mockDatabase.nextId++,
      name,
      email,
      password_hash,
      created_at: new Date().toISOString()
    }
    mockDatabase.users.push(newUser)
    return Promise.resolve([newUser])
  }
  
  if (query.includes('select * from users where email')) {
    const [email] = values
    const user = mockDatabase.users.find(u => u.email === email)
    return Promise.resolve(user ? [user] : [])
  }
  
  // Match operations
  if (query.includes('select * from matches')) {
    return Promise.resolve(mockDatabase.matches)
  }
  
  if (query.includes('select count(*) from matches')) {
    return Promise.resolve([{ count: mockDatabase.matches.length }])
  }
  
  // Team operations
  if (query.includes('select * from teams')) {
    return Promise.resolve(mockDatabase.teams)
  }
  
  // Contest operations
  if (query.includes('select * from contests')) {
    return Promise.resolve(mockDatabase.contests)
  }
  
  // Player operations
  if (query.includes('select * from players')) {
    return Promise.resolve(mockDatabase.players)
  }
  
  // Leaderboard
  if (query.includes('leaderboard') || query.includes('user_stats')) {
    return Promise.resolve([
      { user_id: 1, name: "John Doe", total_points: 2500, rank: 1 },
      { user_id: 2, name: "Jane Smith", total_points: 2300, rank: 2 },
      { user_id: 3, name: "Mike Johnson", total_points: 2100, rank: 3 }
    ])
  }
  
  return Promise.resolve([])
}

// Try to use real database, fallback to mock
let sql: any
try {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "postgresql://user:password@localhost:5432/cricket_fantasy") {
    sql = neon(process.env.DATABASE_URL)
  } else {
    console.log("Using mock database for testing")
    sql = mockSql
  }
} catch (error) {
  console.log("Database connection failed, using mock database")
  sql = mockSql
}

export { sql }
