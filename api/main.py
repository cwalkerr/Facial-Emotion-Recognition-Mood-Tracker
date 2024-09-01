from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints.predict import router as predict_router
from endpoints.users import router as users_router
from endpoints.readings import router as reading_router


app = FastAPI()

# CORS - not recommended for production adding all origins/methods/headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Listening"}

# Routes
app.include_router(predict_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(reading_router, prefix='/api')


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
