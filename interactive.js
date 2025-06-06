// Додаткові інтерактивні функції для навчального сайту

// Симулятор покрокового виконання
class StepByStepSimulator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.array = [];
        this.currentStep = 0;
        this.algorithm = null;
        this.history = [];
    }
    
    init(array, algorithm) {
        this.array = [...array];
        this.algorithm = algorithm;
        this.currentStep = 0;
        this.history = [{array: [...array], action: 'start'}];
        this.render();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="step-controls">
                <button onclick="simulator.previousStep()">← Назад</button>
                <span>Крок ${this.currentStep}/${this.history.length - 1}</span>
                <button onclick="simulator.nextStep()">Вперед →</button>
                <button onclick="simulator.autoPlay()">Автовідтворення</button>
            </div>
            <div class="array-display">
                ${this.array.map((val, idx) => 
                    `<div class="element" data-index="${idx}">${val}</div>`
                ).join('')}
            </div>
            <div class="step-info">
                ${this.history[this.currentStep].action}
            </div>
        `;
    }
    
    nextStep() {
        if (this.currentStep < this.history.length - 1) {
            this.currentStep++;
            this.array = [...this.history[this.currentStep].array];
            this.render();
            this.highlightAction();
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.array = [...this.history[this.currentStep].array];
            this.render();
            this.highlightAction();
        }
    }
    
    highlightAction() {
        const step = this.history[this.currentStep];
        if (step.indices) {
            step.indices.forEach(idx => {
                document.querySelector(`[data-index="${idx}"]`).classList.add('highlighted');
            });
        }
    }
    
    async autoPlay() {
        while (this.currentStep < this.history.length - 1) {
            this.nextStep();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Гра "Сортувальні перегони"
class SortingRace {
    constructor() {
        this.algorithms = {
            bubble: this.bubbleSort,
            selection: this.selectionSort,
            merge: this.mergeSort
        };
        this.results = {};
    }
    
    async race(array, algorithms) {
        const raceContainer = document.getElementById('race-container');
        raceContainer.innerHTML = '<h3>Перегони починаються!</h3>';
        
        const promises = algorithms.map(async (alg) => {
            const startTime = performance.now();
            const sorted = await this.algorithms[alg]([...array]);
            const endTime = performance.now();
            
            return {
                algorithm: alg,
                time: endTime - startTime,
                sorted: sorted
            };
        });
        
        const results = await Promise.all(promises);
        this.displayResults(results);
    }
    
    displayResults(results) {
        results.sort((a, b) => a.time - b.time);
        
        let html = '<h4>Результати:</h4><ol>';
        results.forEach((result, index) => {
            html += `<li>${result.algorithm}: ${result.time.toFixed(2)}ms</li>`;
        });
        html += '</ol>';
        
        document.getElementById('race-results').innerHTML = html;
    }
    
    async bubbleSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
        return arr;
    }
    
    async selectionSort(arr) {
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            }
        }
        return arr;
    }
    
    async mergeSort(arr) {
        if (arr.length <= 1) return arr;
        
        const mid = Math.floor(arr.length / 2);
        const left = await this.mergeSort(arr.slice(0, mid));
        const right = await this.mergeSort(arr.slice(mid));
        
        return this.merge(left, right);
    }
    
    merge(left, right) {
        const result = [];
        let i = 0, j = 0;
        
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }
        
        return result.concat(left.slice(i)).concat(right.slice(j));
    }
}

// Інтерактивний тест із зворотним зв'язком
class InteractiveQuiz {
    constructor(questions) {
        this.questions = questions;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
    }
    
    start() {
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.showQuestion();
    }
    
    showQuestion() {
        const question = this.questions[this.currentQuestion];
        const container = document.getElementById('quiz-container');
        
        container.innerHTML = `
            <div class="question-header">
                <h3>Питання ${this.currentQuestion + 1} з ${this.questions.length}</h3>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(this.currentQuestion / this.questions.length) * 100}%"></div>
                </div>
            </div>
            <div class="question-body">
                <p>${question.text}</p>
                <div class="options">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" onclick="quiz.selectAnswer(${idx})">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div id="feedback" class="feedback"></div>
        `;
    }
    
    selectAnswer(optionIndex) {
        const question = this.questions[this.currentQuestion];
        const isCorrect = optionIndex === question.correct;
        
        this.answers.push({
            question: this.currentQuestion,
            selected: optionIndex,
            correct: isCorrect
        });
        
        if (isCorrect) {
            this.score++;
        }
        
        this.showFeedback(isCorrect, question.explanation);
        
        setTimeout(() => {
            if (this.currentQuestion < this.questions.length - 1) {
                this.currentQuestion++;
                this.showQuestion();
            } else {
                this.showResults();
            }
        }, 2000);
    }
    
    showFeedback(isCorrect, explanation) {
        const feedback = document.getElementById('feedback');
        feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
        feedback.innerHTML = `
            <p>${isCorrect ? '✓ Правильно!' : '✗ Неправильно!'}</p>
            <p>${explanation}</p>
        `;
    }
    
    showResults() {
        const container = document.getElementById('quiz-container');
        const percentage = (this.score / this.questions.length) * 100;
        
        container.innerHTML = `
            <div class="results">
                <h2>Результати тесту</h2>
                <div class="score-circle">
                    <span class="score">${this.score}/${this.questions.length}</span>
                    <span class="percentage">${percentage.toFixed(0)}%</span>
                </div>
                <div class="detailed-results">
                    ${this.answers.map((ans, idx) => `
                        <div class="result-item ${ans.correct ? 'correct' : 'incorrect'}">
                            Питання ${idx + 1}: ${ans.correct ? '✓' : '✗'}
                        </div>
                    `).join('')}
                </div>
                <button onclick="quiz.start()">Пройти ще раз</button>
            </div>
        `;
    }
}

// Візуальний конструктор алгоритмів
class AlgorithmBuilder {
    constructor() {
        this.blocks = [];
        this.code = '';
    }
    
    addBlock(type, params) {
        this.blocks.push({ type, params });
        this.updateCode();
        this.render();
    }
    
    removeBlock(index) {
        this.blocks.splice(index, 1);
        this.updateCode();
        this.render();
    }
    
    updateCode() {
        this.code = this.generateCode();
    }
    
    generateCode() {
        let code = 'def custom_sort(arr):\n';
        
        this.blocks.forEach(block => {
            switch(block.type) {
                case 'loop':
                    code += `    for i in range(${block.params.start}, ${block.params.end}):\n`;
                    break;
                case 'compare':
                    code += `        if arr[${block.params.index1}] > arr[${block.params.index2}]:\n`;
                    break;
                case 'swap':
                    code += `            arr[${block.params.index1}], arr[${block.params.index2}] = arr[${block.params.index2}], arr[${block.params.index1}]\n`;
                    break;
            }
        });
        
        code += '    return arr';
        return code;
    }
    
    render() {
        const container = document.getElementById('builder-container');
        container.innerHTML = `
            <div class="blocks-panel">
                <h3>Блоки алгоритму</h3>
                ${this.blocks.map((block, idx) => `
                    <div class="algorithm-block">
                        ${block.type}: ${JSON.stringify(block.params)}
                        <button onclick="builder.removeBlock(${idx})">×</button>
                    </div>
                `).join('')}
            </div>
            <div class="code-preview">
                <h3>Згенерований код</h3>
                <pre>${this.code}</pre>
            </div>
            <div class="add-block-panel">
                <h3>Додати блок</h3>
                <button onclick="builder.showAddBlockDialog('loop')">Цикл</button>
                <button onclick="builder.showAddBlockDialog('compare')">Порівняння</button>
                <button onclick="builder.showAddBlockDialog('swap')">Обмін</button>
            </div>
        `;
    }
    
    showAddBlockDialog(type) {
        // Тут можна додати модальне вікно для введення параметрів
        const params = prompt(`Введіть параметри для ${type}`);
        if (params) {
            this.addBlock(type, JSON.parse(params));
        }
    }
}

// Ініціалізація об'єктів
const simulator = new StepByStepSimulator('step-simulator');
const race = new SortingRace();
const quiz = new InteractiveQuiz([
    {
        text: "Яка основна ідея bubble sort?",
        options: [
            "Знайти мінімум і поставити на початок",
            "Порівнювати сусідні елементи і міняти їх місцями",
            "Розділити масив навпіл",
            "Вставити елемент на правильне місце"
        ],
        correct: 1,
        explanation: "Bubble sort порівнює сусідні елементи і міняє їх місцями, якщо вони в неправильному порядку."
    },
    {
        text: "Яка часова складність merge sort?",
        options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"],
        correct: 2,
        explanation: "Merge sort має часову складність O(n log n) у всіх випадках."
    }
]);
const builder = new AlgorithmBuilder();

// Додаткові утиліти
function saveProgress() {
    const progress = {
        completedLessons: [],
        quizScores: [],
        lastVisited: new Date().toISOString()
    };
    
    // Зберігаємо в localStorage
    localStorage.setItem('sortingProgress', JSON.stringify(progress));
}

function loadProgress() {
    const saved = localStorage.getItem('sortingProgress');
    if (saved) {
        return JSON.parse(saved);
    }
    return null;
}

// Експорт для використання в інших файлах
window.sortingTools = {
    simulator,
    race,
    quiz,
    builder,
    saveProgress,
    loadProgress
};