FROM ubuntu:22.04

RUN apt-get update && apt-get install -y libsndfile1 ffmpeg
RUN apt install python3-pip -y

# Estos son dependencias del TTS
# RUN pip3 install Cython==3.0.9
# RUN pip3 install nemo_toolkit['all']==1.22.0
# RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy directory
WORKDIR /app
COPY . /app
RUN pip3 install --no-cache-dir -r /app/requirements.txt

# Expose port: Gunicorn is 8000. Python is 5000
EXPOSE 8000

# Command to run the application (use -b 0.0.0.0 for local test)
CMD ["gunicorn", "-w 4", "-b 0.0.0.0", "wsgi:app"]