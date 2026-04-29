## Tech Stack detailed

| Layer / Category      | Selected Tool / Approach  | Compatibility Status | Critical Notes            |
| --------------------- | ------------------------- | -------------------- | ------------------------- |
| React Router          | react-router-dom (v6+)    | ✅ Fully Compatible  | Stable routing            |
| HTTP Client           | axios                     | ✅ Fully Compatible  | Works with FastAPI        |
| Form Handling         | react-hook-form           | ✅ Fully Compatible  | Use Controller for Chakra |
| Validation (Frontend) | zod                       | ✅ Fully Compatible  | Manual sync with backend  |
| State Management      | useState + useContext     | ✅ Fully Compatible  | Simple and sufficient     |
| UI Components         | Chakra UI                 | ✅ Fully Compatible  | Central styling           |
| Notifications         | Chakra useToast           | ✅ Fully Compatible  | Native integration        |
| CSS                   | Chakra styling system     | ✅ Fully Compatible  | Avoid mixing frameworks   |
| Loading State         | useState + Chakra Spinner | ✅ Fully Compatible  | No extra libs needed      |

| API Router Layer | FastAPI APIRouter | ✅ Fully Compatible | Modular routes |
| Request Validation | Pydantic (BaseModel) | ✅ Fully Compatible | Core validation |
| Response Serialization | response_model (Pydantic) | ✅ Fully Compatible | Strong contracts |
| Dependency Injection | FastAPI Depends | ✅ Fully Compatible | Built-in DI |
| Business Logic | Service layer (Python classes/functions) | ✅ Fully Compatible | Keep separate |
| Exception Handling | HTTPException | ✅ Fully Compatible | Extend later if needed |
| Auth / Secrets | OAuth2PasswordBearer + python-dotenv + DB Login table | ⚠️ Partial | Missing hashing + JWT |
| Swagger Docs | Built-in OpenAPI | ✅ Fully Compatible | Default |
| CORS | CORSMiddleware | ✅ Fully Compatible | Required for frontend |

| ORM / DB Layer | SQLAlchemy ORM | ✅ Fully Compatible | Industry standard |
| Database | SQLite | ⚠️ Conditional | Not scalable |
| Tables | SQLAlchemy models | ✅ Fully Compatible | Separate from Pydantic |
| Indexes | SQLAlchemy Index | ✅ Fully Compatible | Explicit control |
| Constraints | SQLAlchemy constraints | ✅ Fully Compatible | More flexible than SQLModel |
| Foreign Keys | SQLAlchemy relationships | ⚠️ Conditional | Enable PRAGMA foreign_keys=ON |
| Transactions | SQLAlchemy Session | ✅ Fully Compatible | Explicit control |
| Query Engine | create_engine("sqlite:///db.db") | ✅ Fully Compatible | Standard |

| Migrations | Alembic | ⚠️ Needs Setup | Must link SQLAlchemy Base metadata |
| Migration Strategy | Linear history | ✅ Fully Compatible | Good for solo |
| Schema Evolution | Alembic --autogenerate | ⚠️ Review Needed | Not always accurate |
| Version Control | Alembic versions | ✅ Fully Compatible | Required |
