document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topic');
    const voiceSelect = document.getElementById('voice');
    const generateBtn = document.getElementById('generateBtn');
    const jokeContainer = document.querySelector('.joke-text');
    const feedbackSection = document.querySelector('.feedback-section');
    const feedbackInput = document.getElementById('feedback');
    const modifyBtn = document.getElementById('modifyBtn');
    const newJokeBtn = document.getElementById('newJokeBtn');
    const analysisSection = document.querySelector('.analysis-section');

    let currentJoke = null;
    let currentTopic = null;
    let currentVoice = null;

    // Clear existing options
    voiceSelect.innerHTML = '';

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = "Select a comedian's style";
    voiceSelect.appendChild(defaultOption);

    // Fetch comedians and populate dropdown
    fetch('/api/comedians')
        .then(res => res.json())
        .then(comedians => {
            comedians.forEach(comedian => {
                const option = document.createElement('option');
                option.value = comedian.value;
                option.textContent = comedian.label;
                voiceSelect.appendChild(option);
            });
        })
        .catch(err => {
            // Show error in dropdown if fetch fails
            voiceSelect.innerHTML = '';
            const errorOption = document.createElement('option');
            errorOption.value = '';
            errorOption.textContent = 'Error loading comedians';
            voiceSelect.appendChild(errorOption);
            console.error('Failed to load comedians:', err);
        });

    async function analyzeJoke(joke, voice) {
        try {
            const response = await fetch('/api/analyze-joke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ joke, voice })
            });

            const data = await response.json();

            if (response.ok) {
                // Update analysis cards
                const setupCard = document.getElementById('setup-analysis');
                const punchlineCard = document.getElementById('punchline-analysis');
                const styleCard = document.getElementById('style-analysis');
                const strengthsCard = document.getElementById('strengths-analysis');
                const improvementsCard = document.getElementById('improvements-analysis');
                const feedbackCard = document.getElementById('feedback-suggestions');

                setupCard.textContent = data.analysis.setup || "No setup analysis available";
                punchlineCard.textContent = data.analysis.punchline || "No punchline analysis available";
                styleCard.textContent = data.analysis.styleElements || "No style analysis available";
                strengthsCard.textContent = data.analysis.strengths || "No strengths analysis available";
                improvementsCard.textContent = data.analysis.improvements || "No improvements analysis available";
                feedbackCard.textContent = data.analysis.feedback || "";

                // Update feedback suggestions
                const suggestionsList = document.getElementById('feedback-suggestions');
                suggestionsList.innerHTML = '';
                if (data.analysis.feedbacksuggestions) {
                    const suggestions = data.analysis.feedbacksuggestions.split('\n').filter(s => s.trim());
                    suggestions.forEach(suggestion => {
                        const li = document.createElement('li');
                        li.textContent = suggestion.replace(/^\d+\.\s*/, '');
                        suggestionsList.appendChild(li);
                    });
                }

                // Show analysis section
                analysisSection.classList.remove('hidden');
            } else {
                console.error('Error analyzing joke:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function generateJoke() {
        const topic = topicInput.value.trim();
        const voice = voiceSelect.value;

        if (!topic) {
            jokeContainer.textContent = 'Please enter a topic!';
            return;
        }

        if (!voice) {
            jokeContainer.textContent = 'Please select a comedian!';
            return;
        }

        // Show loading state
        generateBtn.disabled = true;
        jokeContainer.textContent = 'Generating joke...';
        feedbackSection.classList.add('hidden');
        analysisSection.classList.add('hidden');

        try {
            const response = await fetch(`/api/joke?topic=${encodeURIComponent(topic)}&voice=${encodeURIComponent(voice)}`);
            const data = await response.json();

            if (response.ok) {
                currentJoke = data.joke;
                currentTopic = topic;
                currentVoice = voice;
                jokeContainer.innerHTML = `${data.joke}<div class="comedian-name">- In the style of ${data.comedian}</div>`;
                feedbackSection.classList.remove('hidden');
                feedbackInput.value = '';

                // Analyze the joke
                await analyzeJoke(data.joke, voice);
            } else {
                jokeContainer.textContent = `Error: ${data.error || 'Failed to generate joke'}`;
            }
        } catch (error) {
            console.error('Error:', error);
            jokeContainer.textContent = 'Error: Failed to connect to the server';
        } finally {
            generateBtn.disabled = false;
        }
    }

    async function modifyJoke() {
        const feedback = feedbackInput.value.trim();

        if (!feedback) {
            alert('Please enter feedback for the joke modification!');
            return;
        }

        // Show loading state
        modifyBtn.disabled = true;
        jokeContainer.textContent = 'Modifying joke...';
        analysisSection.classList.add('hidden');

        try {
            const response = await fetch('/api/modify-joke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalJoke: currentJoke,
                    feedback,
                    topic: currentTopic,
                    voice: currentVoice
                })
            });

            const data = await response.json();

            if (response.ok) {
                currentJoke = data.joke;
                jokeContainer.innerHTML = `${data.joke}<div class="comedian-name">- In the style of ${data.comedian}</div>`;
                feedbackInput.value = '';

                // Analyze the modified joke
                await analyzeJoke(data.joke, currentVoice);
            } else {
                jokeContainer.textContent = `Error: ${data.error || 'Failed to modify joke'}`;
            }
        } catch (error) {
            console.error('Error:', error);
            jokeContainer.textContent = 'Error: Failed to connect to the server';
        } finally {
            modifyBtn.disabled = false;
        }
    }

    // Event listeners
    generateBtn.addEventListener('click', generateJoke);
    modifyBtn.addEventListener('click', modifyJoke);
    newJokeBtn.addEventListener('click', generateJoke);

    // Allow Enter key to submit
    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateJoke();
    });

    const selectedVoice = voiceSelect.value;
    const selectedLabel = voiceSelect.options[voiceSelect.selectedIndex].text;
});
