import jwt
from dotenv import load_dotenv
import os
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

load_dotenv()
JWT_PUBLIC_KEY = os.getenv("JWT_PUBLIC_KEY")
ALGORITHM = os.getenv("ALGORITHM")


# handles token verification, no payload is required only checks if the token is valid
def verify_token(token: str) -> dict:
    try:
        jwt.decode(token, JWT_PUBLIC_KEY, algorithms=[ALGORITHM])
        return {"valid": True}
    # covers most of the possible errors that can occur when decoding a token
    except ExpiredSignatureError:
        return {'valid': False, 'message': 'Unauthorised: Token expired'}
    except InvalidTokenError as e:
        return {'valid': False, 'message': 'Unauthorised: Invalid token'}
    except Exception as e:
        return {'valid': False, 'message': str(e)}
    