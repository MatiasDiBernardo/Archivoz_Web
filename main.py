from website import create_app

app = create_app()
app.config['UPLOAD_FOLDER'] = 'uploads'

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0')
