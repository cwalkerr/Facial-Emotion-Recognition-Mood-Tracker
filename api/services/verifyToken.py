import jwt
from dotenv import load_dotenv
import os
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError, InvalidSignatureError, DecodeError, ImmatureSignatureError, InvalidAudienceError, InvalidIssuerError

load_dotenv()
JWT_PUBLIC_KEY = os.getenv("JWT_PUBLIC_KEY")
ALGORITHM = os.getenv("ALGORITHM")


# handles token verification, no payload is required only checks if the token is valid
def verify_token(token: str) -> dict:
    try:
        # leeway is set to 10 seconds, common bug was recieving ImmatureSignatureError, likely clock skew
        jwt.decode(token, JWT_PUBLIC_KEY, algorithms=[ALGORITHM], options={'leeway': 10})
        return {"valid": True}
    except ExpiredSignatureError:
        return {'valid': False, 'message': 'Unauthorised: Token expired'}
    except InvalidSignatureError:
        return {'valid': False, 'message': 'Unauthorised: Invalid signature'}
    except DecodeError:
        return {'valid': False, 'message': 'Unauthorised: Decode error'}
    except ImmatureSignatureError:
        return {'valid': False, 'message': 'Unauthorised: Token not yet valid'}
    except InvalidAudienceError:
        return {'valid': False, 'message': 'Unauthorised: Invalid audience'}
    except InvalidIssuerError:
        return {'valid': False, 'message': 'Unauthorised: Invalid issuer'}
    except InvalidTokenError as e:
        return {'valid': False, 'message': 'Unauthorised: Invalid token'}
    except Exception as e:
        return {'valid': False, 'message': str(e)}
    