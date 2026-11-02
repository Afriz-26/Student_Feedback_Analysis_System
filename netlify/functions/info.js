// Project data served to the website. Benchmarks are the base paper's reported values (Table 7).
exports.handler = async () => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  body: JSON.stringify({
    paper: { authors: "Abdi, Sedrakyan, Veldkamp, van Hillegersberg, van den Berg", title: "Students feedback analysis model using deep learning-based method and linguistic knowledge for intelligent educational systems", venue: "Soft Computing 27, 14073-14094 (2023)", doi: "10.1007/s00500-023-07926-2" },
    benchmarks: [["DT",51.79],["NB",54.39],["ANN",56.36],["RF",57.89],["SVM",63.33],["CNN",68.18],["LSTM",74.03],["BiLSTM",78.65],["CNN-LSTM",82.28],["BERT",83.33],["CNN-BiLSTM",84.52],["DTLP (paper)",88.78]],
    pipeline: [
      { name: "Pre-processing", text: "Tokenize, remove stop words, stem and POS-tag each comment." },
      { name: "Feature extraction", text: "Word embeddings, ten merged sentiment lexicons, negation and contrast rules, sentence types." },
      { name: "CNN", text: "Finds short local patterns such as 'not organized'." },
      { name: "BiLSTM and attention", text: "Reads in both directions and weights the words that decide the meaning." },
      { name: "Classification", text: "Joins sentence-level features and outputs positive or negative." }
    ],
    extension: [
      { name: "Contextual embeddings", text: "Test DistilBERT embeddings against word2vec on the same data." },
      { name: "Aspect-wise results", text: "Tag each comment: teaching, course content, facilities, assessment." },
      { name: "Dashboard and API", text: "Upload comments, see charts and export results." }
    ],
    roadmap: [
      { stage: "Title, base paper and abstract", status: "Done" },
      { stage: "Presentation, website and API", status: "Done" },
      { stage: "Dataset collection and cleaning", status: "Next" },
      { stage: "Baseline CNN-BiLSTM-attention model", status: "Planned" },
      { stage: "DistilBERT extension and aspect tagging", status: "Planned" },
      { stage: "Connect trained model to the API, final testing", status: "Planned" }
    ],
    engine: "Rule-based demo engine (word lists, negation and contrast rules). The deep learning model replaces it in a later stage.",
    team: [{ name: "", roll: "25102A040282" }, { name: "", roll: "25102A040286" }, { name: "", roll: "25102A040305" }, { name: "", roll: "25102A040313" }, { name: "", roll: "25102A040324" }]
  })
});
