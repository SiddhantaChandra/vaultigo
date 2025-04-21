# Load the model and vectorizer
import joblib
def givephiprob(data):
    rnd_forest_model = joblib.load('rnd_forest_model.pkl')
    rnd_forest_vectorizer = joblib.load('rnd_forest_vect.pkl')
    linear_model = joblib.load('phishingmodel.pkl')
    linear_vectorizer = joblib.load('phisi_tfidf.pkl')
    email_tfidf =rnd_forest_vectorizer.transform(data)
    proba = rnd_forest_model.predict_proba(email_tfidf)
    forestproba_phishing = proba[0][1]
    forestproba_notphishing = proba[0][0]
    email_tfidf =linear_vectorizer.transform(data)
    proba = linear_model.predict_proba(email_tfidf)
    linear_phi = proba[0][1]
    linear_phi_not = proba[0][0]
    avgprob = (forestproba_phishing+linear_phi)/2
    return avgprob




