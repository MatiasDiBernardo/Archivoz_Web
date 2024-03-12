from googleapiclient.discovery import build
from google.oauth2 import service_account
import os

SCOPE = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = os.path.join('routines', 'archivoz-backup-de3a274eace7.json')
# Folder for audio backups
PARENT_FOLDER_ID = "19MqMZZfbFbukczHjrXz5cp0KIvjKGfwb"  # ID is URL on the foder to upload

def authenticate():
    creds = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPE)
    return creds

def upload_file(file_path, name):
    """Uploads a file to the google drive.

    Args:
        file_path (str): Path to the file to upload.
        name (str): Name to save the file.
    """
    creds = authenticate()
    service = build('drive', 'v3', credentials=creds)

    file_metadata = {
        "name" : name, 
        "parents": [PARENT_FOLDER_ID]
    }

    file = service.files().create(
        body=file_metadata,
        media_body=file_path
    ).execute()
