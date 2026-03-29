import fs from 'fs';
import path from 'path';

export class HistoryManager {
    constructor(dbPath = './history.json') {
        this.dbPath = path.resolve(dbPath);
        this.history = [];
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                this.history = JSON.parse(data);
            }
        } catch (error) {
            console.error("Error loading history:", error);
        }
    }

    save() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error("Error saving history:", error);
        }
    }

    addEntry(expression, result) {
        const entry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            expression,
            result
        };
        this.history.push(entry);
        this.save();
        return entry;
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
        this.save();
    }

    exportToCSV(exportPath) {
        try {
            let csv = "ID,Timestamp,Expression,Result\n";
            this.history.forEach(item => {
                csv += `${item.id},${item.timestamp},"${item.expression}","${item.result}"\n`;
            });
            fs.writeFileSync(exportPath, csv);
            return true;
        } catch (e) {
            return false;
        }
    }

    exportToTXT(exportPath) {
        try {
            let txt = "Calculator History\n=================\n\n";
            this.history.forEach(item => {
                txt += `[${item.timestamp}] ${item.expression} = ${item.result}\n`;
            });
            fs.writeFileSync(exportPath, txt);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export class MemoryManager {
    constructor() {
        this.memory = 0;
    }

    add(value) {
        this.memory += value;
        return this.memory;
    }

    subtract(value) {
        this.memory -= value;
        return this.memory;
    }

    recall() {
        return this.memory;
    }

    clear() {
        this.memory = 0;
    }
}
