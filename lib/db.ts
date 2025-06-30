import { neon } from "@neondatabase/serverless"

// Mock database for testing when DATABASE_URL is not available
const mockDatabase = {
  users: [] as any[],
  nextId: 1
}

// Mock SQL template function
const mockSql = (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.join('?')
  
  // Mock user registration
  if (query.includes('INSERT INTO users')) {
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
  
  // Mock user selection
  if (query.includes('SELECT * FROM users WHERE email')) {
    const [email] = values
    const user = mockDatabase.users.find(u => u.email === email)
    return Promise.resolve(user ? [user] : [])
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
