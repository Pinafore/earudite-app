# app.py
from flask import Flask, request, jsonify
from qa_metrics.pedant import PEDANT

app = Flask(__name__)
pedant = PEDANT()

@app.route('/evaluate', methods=['POST'])
def evaluate_answer():
    data = request.json
    reference_answer = data.get("reference_answer", [])
    candidate_answer = data.get("candidate_answer", "")
    question = data.get("question", "")
    
    if not reference_answer or not candidate_answer or not question:
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        match_result = pedant.evaluate(reference_answer, candidate_answer, question)
        return jsonify({"match": match_result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

