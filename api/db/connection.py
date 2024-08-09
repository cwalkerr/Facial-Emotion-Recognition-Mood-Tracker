from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text
from dotenv import load_dotenv
import os
import asyncio

load_dotenv()

# helps with windows compatibility
if os.name == 'nt':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Get environment variables
username = os.getenv("DB_USERNAME")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_NAME")

# db connection engine
engine = create_async_engine(f"postgresql+psycopg://{username}:{password}@{host}:{port}/{database}", echo=True) # echo prints logs

# configure session
Session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=True # not sure
)
# run file to test connection
async def test_connection():
    async with Session() as session:
        try:
            result = await session.execute(text('SELECT * from users'))
            rows = result.fetchall()
            for row in rows:
                print(row)                
        except Exception as e:
            print("Connection failed:", e)

# test connection
asyncio.run(test_connection())