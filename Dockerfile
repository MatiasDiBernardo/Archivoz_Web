FROM ubuntu:latest

# Dependencies of the environment
RUN apt-get update && apt-get install -y libsndfile1 ffmpeg
RUN apt install python3-pip -y

RUN pip3 install Cython
RUN pip3 install nemo_toolkit['all']
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy directory
WORKDIR /app
COPY . /app
RUN pip3 install --no-cache-dir -r /app/requirements.txt

# Expose port 8000
EXPOSE 8000

# Define the command to run your application
CMD ["guinicorn", "wsgi:app"]