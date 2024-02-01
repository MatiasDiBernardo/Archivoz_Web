FROM ubuntu:latest

WORKDIR /app

COPY . /app

# Dependencies of the enviroment
RUN apt-get update && apt-get install -y libsndfile1 ffmpeg
RUN apt install python3-pip -y

RUN pip3 install Cython
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip3 install nemo_toolkit['all']
RUN pip3 install --no-cache-dir -r /app/requirements.txt

# Expose port 5000
EXPOSE 5000

# Define the command to run your application
CMD ["python3", "main.py"]