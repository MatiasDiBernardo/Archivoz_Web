from nemo.collections.tts.models import HifiGanModel
from nemo.collections.tts.models import FastPitchModel
import torch
import scipy

text = "A ver que pasa si hago algo como esto"
save_audio_path = "test1.wav"

path_to_ckpt = "models/cortazar.ckpt"
hifigan_name = "tts_es_hifigan_ft_fastpitch_multispeaker"

def infer(spec_gen_model, vocoder_model, str_input, speaker=None):
    """
    Synthesizes spectrogram and audio from a text string given a spectrogram synthesis and vocoder model.

    Args:
        spec_gen_model: Spectrogram generator model (FastPitch in our case)
        vocoder_model: Vocoder model (HiFiGAN in our case)
        str_input: Text input for the synthesis
        speaker: Speaker ID

    Returns:
        spectrogram and waveform of the synthesized audio.
    """
    spec_gen_model.eval()
    vocoder_model.eval()
    with torch.no_grad():
        parsed = spec_gen_model.parse(str_input)
        if speaker is not None:
            speaker = torch.tensor([speaker]).long().to(device=spec_gen_model.device)
        spectrogram = spec_gen_model.generate_spectrogram(tokens=parsed, speaker=speaker)
        audio = vocoder_model.convert_spectrogram_to_audio(spec=spectrogram)

    if isinstance(audio, torch.Tensor):
        audio = audio.to('cpu').numpy()

    return audio

# Load spectrogram generator
spec_generator = FastPitchModel.load_from_checkpoint(path_to_ckpt, map_location=torch.device('cpu'))

# Load Vocoder
model_vocoder = HifiGanModel.from_pretrained(hifigan_name)

# Make inferece and save the audio
audio_infer = infer(spec_generator, model_vocoder, text, speaker=0)
audio_infer = audio_infer[0, :]

print("Hasta acá llega parece")
print(len(audio_infer))
print(audio_infer.shape)


scipy.io.wavfile.write(save_audio_path, 22050, audio_infer)
#sf.write(save_audio_path, audio_infer, samplerate=22050)
