import inquirer from 'inquirer';
import chalk from 'chalk';
import { add, subtract, multiply, divide, modulus, percentage, squareRoot, power, sin, cos, tan, log10, factorial, evaluateExpression } from '../core/mathCore.js';
import { calculateBMI, calculateAge, convertCurrency, convertLength, convertWeight, convertTemperature } from '../core/converters.js';
import { HistoryManager, MemoryManager } from '../core/history.js';

const history = new HistoryManager();
const memory = new MemoryManager();

const mainMenu = async () => {
    console.clear();
    console.log(chalk.bold.cyan('\n  ==== MULTI-PLATFORM CALCULATOR ====  \n'));
    console.log(chalk.yellow(`Memory: ${memory.recall()} | Last Expr: ${history.getHistory().slice(-1)[0]?.expression || 'None'}\n`));

    const { option } = await inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'Select an operation:',
            choices: [
                '1. Standard Calculator',
                '2. Evaluate Expression',
                '3. Converters (BMI, Age, Currency, etc)',
                '4. History & Memory',
                '5. Exit'
            ]
        }
    ]);

    switch (option[0]) {
        case '1': return standardCalc();
        case '2': return expressionCalc();
        case '3': return convertersMenu();
        case '4': return historyMenu();
        case '5': process.exit(0);
    }
};

const standardCalc = async () => {
    const { op } = await inquirer.prompt([
        {
            type: 'list',
            name: 'op',
            message: 'Select operation:',
            choices: ['Add (+)', 'Subtract (-)', 'Multiply (*)', 'Divide (/)', 'Modulus (%)', 'Square Root (sqrt)', 'Power (^)', 'Sin', 'Cos', 'Tan', 'Log10', 'Factorial (!)', 'Back']
        }
    ]);
    if (op === 'Back') return mainMenu();

    // Simplify parsing
    let num1, num2;
    if (['Add (+)', 'Subtract (-)', 'Multiply (*)', 'Divide (/)', 'Modulus (%)', 'Power (^)'].includes(op)) {
        const res = await inquirer.prompt([
            { type: 'number', name: 'n1', message: 'Enter first number:' },
            { type: 'number', name: 'n2', message: 'Enter second number:' }
        ]);
        num1 = res.n1; num2 = res.n2;
    } else {
        const res = await inquirer.prompt([{ type: 'number', name: 'n1', message: 'Enter number:' }]);
        num1 = res.n1;
    }

    try {
        let result = 0;
        let symbol = '';
        if (op === 'Add (+)') { result = add(num1, num2); symbol = '+'; }
        if (op === 'Subtract (-)') { result = subtract(num1, num2); symbol = '-'; }
        if (op === 'Multiply (*)') { result = multiply(num1, num2); symbol = '*'; }
        if (op === 'Divide (/)') { result = divide(num1, num2); symbol = '/'; }
        if (op === 'Modulus (%)') { result = modulus(num1, num2); symbol = '%'; }
        if (op === 'Power (^)') { result = power(num1, num2); symbol = '^'; }
        if (op === 'Square Root (sqrt)') { result = squareRoot(num1); symbol = 'sqrt'; }
        if (op === 'Sin') { result = sin(num1); symbol = 'sin'; }
        if (op === 'Cos') { result = cos(num1); symbol = 'cos'; }
        if (op === 'Tan') { result = tan(num1); symbol = 'tan'; }
        if (op === 'Log10') { result = log10(num1); symbol = 'log10'; }
        if (op === 'Factorial (!)') { result = factorial(num1); symbol = '!'; }

        const expr = num2 !== undefined ? `${num1} ${symbol} ${num2}` : `${symbol}(${num1})`;
        history.addEntry(expr, result);
        console.log(chalk.green(`\nResult: ${result}\n`));
    } catch (e) {
        console.log(chalk.red(`\n${e.message}\n`));
    }

    await waitKeyPress();
    mainMenu();
};

const expressionCalc = async () => {
    const { expr } = await inquirer.prompt([{ type: 'input', name: 'expr', message: 'Enter math expression (e.g. 2 + 2 * sqrt(9)):' }]);
    try {
        const result = evaluateExpression(expr);
        history.addEntry(expr, result);
        console.log(chalk.green(`\nResult: ${result}\n`));
    } catch (e) {
        console.log(chalk.red(`\n${e.message}\n`));
    }
    await waitKeyPress();
    mainMenu();
};

const convertersMenu = async () => {
    const { opt } = await inquirer.prompt([{
        type: 'list', name: 'opt', message: 'Choose calculator:',
        choices: ['BMI', 'Age', 'Currency', 'Back']
    }]);
    if (opt === 'Back') return mainMenu();

    try {
        if (opt === 'BMI') {
            const an = await inquirer.prompt([{ type: 'number', name: 'w', message: 'Weight (kg):' }, { type: 'number', name: 'h', message: 'Height (cm):' }]);
            const bmi = calculateBMI(an.w, an.h);
            console.log(chalk.cyan(`\nYour BMI is: ${bmi.toFixed(2)}\n`));
        } else if (opt === 'Age') {
            const an = await inquirer.prompt([{ type: 'input', name: 'd', message: 'Birth date (YYYY-MM-DD):' }]);
            const age = calculateAge(an.d);
            console.log(chalk.cyan(`\nYour Age is: ${age}\n`));
        } else if (opt === 'Currency') {
            const an = await inquirer.prompt([
                { type: 'number', name: 'amt', message: 'Amount:' },
                { type: 'list', name: 'from', message: 'From:', choices: ['USD', 'EUR', 'GBP', 'INR', 'JPY'] },
                { type: 'list', name: 'to', message: 'To:', choices: ['USD', 'EUR', 'GBP', 'INR', 'JPY'] }
            ]);
            const converted = convertCurrency(an.amt, an.from, an.to);
            console.log(chalk.cyan(`\nConverted: ${converted.toFixed(2)} ${an.to}\n`));
        }
    } catch (e) {
        console.log(chalk.red(`\n${e.message}\n`));
    }
    await waitKeyPress();
    mainMenu();
};

const historyMenu = async () => {
    const { act } = await inquirer.prompt([{
        type: 'list', name: 'act', message: 'History Options:',
        choices: ['View History', 'Clear History', 'Export to TXT', 'Export to CSV', 'Memory Operations', 'Back']
    }]);
    if (act === 'Back') return mainMenu();

    if (act === 'View History') {
        const hist = history.getHistory();
        if (hist.length === 0) console.log(chalk.gray('No history available.'));
        else hist.forEach((h, i) => console.log(chalk.gray(`[${i + 1}] ${h.timestamp.slice(11, 19)}: ${h.expression} = `) + chalk.green(h.result)));
    } else if (act === 'Clear History') {
        history.clearHistory();
        console.log(chalk.green('History cleared.'));
    } else if (act === 'Export to TXT') {
        history.exportToTXT('./history.txt');
        console.log(chalk.green('Exported to history.txt'));
    } else if (act === 'Export to CSV') {
        history.exportToCSV('./history.csv');
        console.log(chalk.green('Exported to history.csv'));
    } else if (act === 'Memory Operations') {
        const { memAct } = await inquirer.prompt([{
            type: 'list', name: 'memAct', message: 'Memory:', choices: ['M+ (Add last result)', 'MC (Clear)']
        }]);
        if (memAct === 'MC (Clear)') {
            memory.clear();
            console.log(chalk.green('Memory cleared.'));
        } else {
            const last = history.getHistory().slice(-1)[0];
            if (last && !isNaN(last.result)) {
                memory.add(Number(last.result));
                console.log(chalk.green(`Added ${last.result} to Memory.`));
            } else console.log(chalk.red('No valid previous result to add.'));
        }
    }

    await waitKeyPress();
    mainMenu();
};

const waitKeyPress = async () => {
    await inquirer.prompt([{ type: 'input', name: 'x', message: 'Press Enter to continue...' }]);
};

mainMenu();
