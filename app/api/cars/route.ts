import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'cars.db');
    const db = new Database(dbPath, { readonly: true });
    
    const cars = db.prepare('SELECT * FROM cars ORDER BY createdAt DESC').all();
    
    db.close();
    
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}
