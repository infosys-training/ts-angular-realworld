"""Entry point to run the Incident Management API server."""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "incident_management.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
