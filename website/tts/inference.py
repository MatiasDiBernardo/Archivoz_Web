# from nemo.collections.tts.models import HifiGanModel
# from nemo.collections.tts.models import FastPitchModel
# import torch
# import scipy

# name = "Juan"
# text = "Ahora tengo otra voz no? Esperemos que funcione según lo esperado."
# save_audio_path = "test4.wav"

# def infer(str_input, speaker_name):
#     """
#     Synthesizes spectrogram and audio from a text string given a spectrogram synthesis and vocoder model.

#     Args:
#         spec_gen_model: Spectrogram generator model (FastPitch in our case)
#         vocoder_model: Vocoder model (HiFiGAN in our case)
#         str_input: Text input for the synthesis
#         speaker: Speaker ID

#     Returns:
#         spectrogram and waveform of the synthesized audio.
#     """
#     name_to_model = {"Laura": 0, 
#                      "Claudia": 20, 
#                      "Miguel": 67,
#                      "Graciela": 14,
#                      "Rodrigo": 71}
    
#     speaker = name_to_model[speaker_name]
 
#     fastpitch_name = "tts_es_fastpitch_multispeaker"
#     hifigan_name = "tts_es_hifigan_ft_fastpitch_multispeaker"

#     spec_gen_model = FastPitchModel.from_pretrained(fastpitch_name,  map_location=torch.device('cpu')) 
#     vocoder_model = HifiGanModel.from_pretrained(hifigan_name)

#     spec_gen_model.eval()
#     vocoder_model.eval()
#     with torch.no_grad():
#         parsed = spec_gen_model.parse(str_input)
#         if speaker is not None:
#             speaker = torch.tensor([speaker]).long().to(device=spec_gen_model.device)
#         spectrogram = spec_gen_model.generate_spectrogram(tokens=parsed, speaker=speaker)
#         audio = vocoder_model.convert_spectrogram_to_audio(spec=spectrogram)

#     if isinstance(audio, torch.Tensor):
#         audio = audio.to('cpu').numpy()

#     return audio[0, :]  #Removes batch shape

# # Make inferece and save the audio
# #audio_infer = infer(text, name)

# #scipy.io.wavfile.write(save_audio_path, 44100, audio_infer)
# #sf.write(save_audio_path, audio_infer, samplerate=22050)