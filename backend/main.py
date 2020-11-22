from sumy.parsers.html import HtmlParser
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

from cv2 import cv2
import pytesseract 
import speech_recognition as sr

import firebase
import pyrebase 
from google.cloud import storage
from google.cloud.storage import client

import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage
import glob 
import speech_recognition as sr

def n_sentences(input_file):
    if input_file.count('.') >= 10:
        return input_file.count('.')
    return 30

def create_input(input):
    file = open("data/recognized.txt", "w+") 
    file.write("") 
    if '.mpeg' in input or '.wav' in input:
        r = sr.Recognizer()
        with sr.AudioFile(input) as source:
            audio = r.listen(source)
            text = r.recognize_google(audio)
            file.write(text)
            file.write('\n')
            file.close
    else:
        pytesseract.pytesseract.tesseract_cmd = 'C://Program Files//Tesseract-OCR//tesseract.exe'

        img = cv2.imread(input)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) 
        ret, thresh1 = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV) 
        rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (18, 18))
        dilation = cv2.dilate(thresh1, rect_kernel, iterations = 1)
        contours, hierarchy = cv2.findContours(dilation, cv2.RETR_EXTERNAL,  
                                                        cv2.CHAIN_APPROX_NONE) 
        im2 = img.copy()

        for cnt in contours: 
            x, y, w, h = cv2.boundingRect(cnt) 
                
            # Drawing a rectangle on copied image 
            rect = cv2.rectangle(im2, (x, y), (x + w, y + h), (0, 255, 0), 2) 
                
            # Cropping the text block for giving input to OCR 
            cropped = im2[y:y + h, x:x + w] 
                
            # Open the file in append mode 
            file = open("data/recognized.txt", "a") 
                
            # Apply OCR on the cropped image 
            text = pytesseract.image_to_string(cropped) 
                
            # Appending the text into file 
            file.write(text) 
            file.write("\n") 
                
            # Close the file 
            file.close 

config = {
  'apiKey': "AIzaSyCObxou1B_igzkS-8_RMImVsaWjX0V0qGs",
  'authDomain': "cadmus-eba15.firebaseapp.com",
  'databaseURL': "https://cadmus-eba15.firebaseio.com",
  'projectId': "cadmus-eba15",
  'storageBucket': "cadmus-eba15.appspot.com",
  'messagingSenderId': "429388420685",
  'appId': "1:429388420685:web:7070e74b7130f11fcdae04",
  'measurementId': "G-MN3PGPLFZD"
}

firebase = pyrebase.initialize_app(config)
storage = firebase.storage()

LANGUAGE = 'english'
with open('data/recognized.txt', 'r') as input_file:
    SENTENCES_COUNT = int(n_sentences(input_file.read()) * .4)

with open('data/recognized.txt', 'r') as file:  
    data = file.read().replace('\n', '')

storage.child('app/input').download(path='backend/data/app/input.jpeg', filename='data/app/input.jpeg')
storage.child('website/input').download(path='backend/data/website/input.jpeg', filename='data/website/input.jpeg')
storage.child('website/audio').download(path='backend/data/website/input.wav', filename='data/website/input.wav')

#------------------------------
INPUT = 'data/app/input.jpeg'
#---------------------------------

create_input(INPUT) 


parser = PlaintextParser.from_string(data, Tokenizer(LANGUAGE))

stemmer = Stemmer(LANGUAGE)

summarizer = Summarizer(stemmer)
summarizer.stop_words = get_stop_words(LANGUAGE)
output = open('data/notes.txt', 'a+')
output.truncate(0)
for sentence in summarizer(parser.document, SENTENCES_COUNT):
    output.write(str(sentence))
    output.write('\n')

output.close()
output_file = open('data/notes.txt', 'rb')
output_file = output_file.read()

if 'app' in INPUT:
    storage.child('app/output.txt').put(output_file)
elif 'website' in INPUT:
    storage.child('website/output.txt').put(output_file)