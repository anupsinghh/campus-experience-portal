import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experiencesAPI } from '../services/api';
import './CreateExperience.css';

function CreateExperience() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    branch: '',
    year: new Date().getFullYear(),
    package: '',
    tips: '',
    interviewDate: '',
    offerStatus: 'Selected',
    author: '',
    rounds: [{ roundNumber: 1, roundName: '', questions: [''], feedback: '' }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoundChange = (roundIndex, field, value) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      newRounds[roundIndex] = {
        ...newRounds[roundIndex],
        [field]: value,
      };
      return { ...prev, rounds: newRounds };
    });
  };

  const handleQuestionChange = (roundIndex, questionIndex, value) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      const newQuestions = [...newRounds[roundIndex].questions];
      newQuestions[questionIndex] = value;
      newRounds[roundIndex] = {
        ...newRounds[roundIndex],
        questions: newQuestions,
      };
      return { ...prev, rounds: newRounds };
    });
  };

  const addQuestion = (roundIndex) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      newRounds[roundIndex].questions.push('');
      return { ...prev, rounds: newRounds };
    });
  };

  const removeQuestion = (roundIndex, questionIndex) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      newRounds[roundIndex].questions = newRounds[roundIndex].questions.filter(
        (_, idx) => idx !== questionIndex
      );
      return { ...prev, rounds: newRounds };
    });
  };

  const addRound = () => {
    setFormData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          roundNumber: prev.rounds.length + 1,
          roundName: '',
          questions: [''],
          feedback: '',
        },
      ],
    }));
  };

  const removeRound = (roundIndex) => {
    if (formData.rounds.length > 1) {
      setFormData((prev) => ({
        ...prev,
        rounds: prev.rounds.filter((_, idx) => idx !== roundIndex).map((round, idx) => ({
          ...round,
          roundNumber: idx + 1,
        })),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Clean up empty questions
      const cleanedRounds = formData.rounds.map((round) => ({
        ...round,
        questions: round.questions.filter((q) => q.trim() !== ''),
      }));

      const experienceData = {
        ...formData,
        rounds: cleanedRounds,
        year: parseInt(formData.year),
      };

      await experiencesAPI.create(experienceData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/experiences');
      }, 2000);
    } catch (err) {
      setError('Failed to create experience. Please try again.');
      console.error('Error creating experience:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-experience">
      <div className="container">
        <h1 className="page-title">Share Your Interview Experience</h1>
        <p className="page-subtitle">
          Help fellow students by sharing your placement interview journey
        </p>

        {success && (
          <div className="alert alert-success">
            Experience shared successfully! Redirecting to experiences...
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="experience-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="company">Company Name *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Google, Microsoft"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Job Role *</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="branch">Branch *</label>
                <input
                  type="text"
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="2020"
                  max="2030"
                />
              </div>

              <div className="form-group">
                <label htmlFor="package">Package (Optional)</label>
                <input
                  type="text"
                  id="package"
                  name="package"
                  value={formData.package}
                  onChange={handleInputChange}
                  placeholder="e.g., 35 LPA"
                />
              </div>

              <div className="form-group">
                <label htmlFor="interviewDate">Interview Date</label>
                <input
                  type="date"
                  id="interviewDate"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="offerStatus">Offer Status *</label>
                <select
                  id="offerStatus"
                  name="offerStatus"
                  value={formData.offerStatus}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Selected">Selected</option>
                  <option value="Not Selected">Not Selected</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="author">Your Name *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Interview Rounds</h2>
            {formData.rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="round-form">
                <div className="round-header">
                  <h3>Round {round.roundNumber}</h3>
                  {formData.rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRound(roundIndex)}
                      className="btn-remove"
                    >
                      Remove Round
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Round Name *</label>
                    <input
                      type="text"
                      value={round.roundName}
                      onChange={(e) =>
                        handleRoundChange(roundIndex, 'roundName', e.target.value)
                      }
                      required
                      placeholder="e.g., Technical Interview"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Questions Asked</label>
                  {round.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-input-group">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) =>
                          handleQuestionChange(roundIndex, questionIndex, e.target.value)
                        }
                        placeholder="Enter a question asked in this round"
                      />
                      {round.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(roundIndex, questionIndex)}
                          className="btn-remove-small"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addQuestion(roundIndex)}
                    className="btn-add"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="form-group">
                  <label>Feedback/Tips for this Round</label>
                  <textarea
                    value={round.feedback}
                    onChange={(e) =>
                      handleRoundChange(roundIndex, 'feedback', e.target.value)
                    }
                    rows="3"
                    placeholder="Share any tips or feedback specific to this round"
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addRound} className="btn-add">
              + Add Another Round
            </button>
          </div>

          <div className="form-section">
            <h2>General Tips & Advice</h2>
            <div className="form-group">
              <label htmlFor="tips">Overall Tips (Optional)</label>
              <textarea
                id="tips"
                name="tips"
                value={formData.tips}
                onChange={handleInputChange}
                rows="5"
                placeholder="Share general tips, preparation advice, or any other insights that might help others"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sharing...' : 'Share Experience'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/experiences')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExperience;

