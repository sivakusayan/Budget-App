/*eslint-env browser*/

/*-------------------------------------------------------------------------------*/
/* BUDGET CONTROLLER */
/*-------------------------------------------------------------------------------*/

var budgetController = (function () {
    'use strict';
    var Expense, Income, data, calculateTotal;
    
    Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    
    Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1
    };
    
    calculateTotal = function (type) {
        var total = 0;
        
        data.allItems[type].forEach(function (current) {
            total += current.value;
        });
        
        data.totals[type] = total;
    };
    
    return {
        addItem: function (type, desc, val) {
            var newItem, ID;
            
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new expense/income
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function (type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function () {
            
            calculateTotal('exp');
            calculateTotal('inc');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calculatePercentage(data.totals.inc);
            });
        },
        
        getPercentages: function () {
            var percentages;
            
            percentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            
            return percentages;
        },
        
        getBudget: function () {
            return {
                budget: data.budget,
                netIncome: data.totals.inc,
                netExpense: data.totals.exp,
                percentage: data.percentage
            };
        }
    };
    
}());

/*-------------------------------------------------------------------------------*/
/* UI CONTROLLER */
/*-------------------------------------------------------------------------------*/

var UIController = (function () {
    'use strict';
        
    var DOMobjects, reverseString, formatNumber, nodeListForEach;
    
    DOMobjects = {
        typeInput: document.querySelector('.add__type'), //Determines if expense or income
        descriptionInput: document.querySelector('.add__description'),
        valueInput: document.querySelector('.add__value'),
        btnInput: document.querySelector('.add__btn'),
        incomeContainer: document.querySelector('.income__list'),
        expensesContainer: document.querySelector('.expenses__list'),
        budget: document.querySelector('.budget__value'),
        budgetIncome: document.querySelector('.budget__income--value'),
        budgetExpense: document.querySelector('.budget__expenses--value'),
        percentage: document.querySelector('.budget__expenses--percentage'),
        container: document.querySelector('.container'),
        dateLabel: document.querySelector('.budget__title--month')
    };
    
    reverseString = function (str) {
        return str.split("").reverse().join("");
    };
    
    formatNumber = function (num, type) {
        var int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        int = num.split('.')[0];
        dec = num.split('.')[1];

        if (int.length > 3) {
            int = reverseString(int);
            int = int.replace(/(\d{3})/g, "$1,");
            int = reverseString(int);
            
            if (int.charAt(0) === ',') {
                int = int.slice(1, int.length);
            }
        }
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);  
        }
    };

    return {
        getInput: function () {
            return {
                type: DOMobjects.typeInput.value,
                description: DOMobjects.descriptionInput.value,
                value: Number(DOMobjects.valueInput.value)
            };
        },
        
        addListItem: function (obj, type) {
            var html, newHtml, container;
            
            if (type === 'inc') {
                container = DOMobjects.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                container = DOMobjects.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            container.insertAdjacentHTML('beforeend', newHtml);
             
        },
        
        deleteListItem: function (itemID) {
            var item;
            
            item = document.getElementById(itemID);
            item.parentNode.removeChild(item);
        },
        
        clearFields: function () {
            DOMobjects.descriptionInput.value = '';
            DOMobjects.valueInput.value = '';
            
            DOMobjects.descriptionInput.focus();
        },

        getDOMobjects: function () {
            return DOMobjects;
        },
        
        displayBudget: function (obj) {
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            DOMobjects.budget.textContent = formatNumber(obj.budget, type);
            DOMobjects.budgetIncome.textContent = formatNumber(obj.netIncome, 'inc');
            DOMobjects.budgetExpense.textContent = formatNumber(obj.netExpense, 'exp');
            
            if (obj.percentage > 0) {
                DOMobjects.percentage.textContent = obj.percentage + '%';
            } else {
                DOMobjects.percentage.textContent = '---';
            }
        },
        
        displayPercentages: function (percentages) {
            var fields;
            
            fields = document.querySelectorAll('.item__percentage');
            
            nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);  
                }
            };
                
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';   
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, months;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            DOMobjects.dateLabel.textContent = months[now.getMonth()] + ' ' + now.getFullYear();
            
        },
        
        changeType: function () {
            var fields = document.querySelectorAll('.add__type, .add__description, .add__value');
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            })
            
            DOMobjects.btnInput.classList.toggle('red');
        }
        
    };
    
}());

/*-------------------------------------------------------------------------------*/
/* EVENT CONTROLLER */
/*-------------------------------------------------------------------------------*/

var controller = (function (budgetCtrl, UICtrl) {
    'use strict';
    var setupEventListeners, ctrlAddItem, ctrlDeleteItem, updateBudget, updatePercentages;
    
    setupEventListeners = function () {
        var DOMobjects = UICtrl.getDOMobjects();
        
        DOMobjects.btnInput.addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (Event) {
            if (Event.keyCode === 13 || Event.which === 13) {
                ctrlAddItem();
            }
        });
        
        DOMobjects.container.addEventListener('click', ctrlDeleteItem);
        
        DOMobjects.typeInput.addEventListener('change', UICtrl.changeType);
    };
    
    updateBudget = function () {
        var budget;
        
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the Budget
        budget = budgetCtrl.getBudget();
        //3. Display the budget in the UI
        UICtrl.displayBudget(budget);
    };
    
    updatePercentages = function () {
        var percentages;
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();
        //2. Read percentages from the budget controller
        percentages = budgetCtrl.getPercentages();
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        
    };
    
    ctrlAddItem = function () {
        var input, newItem;
        
        //1. Get input data from field
        input = UICtrl.getInput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //2. Transfer data to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. Transfer data to the UI controller
            UICtrl.addListItem(newItem, input.type);
            //4. Clear input fields
            UICtrl.clearFields();
            //5. Calculate and update budget
            updateBudget();
            //6. Calculate and update percentages
            updatePercentages();
        }
    };
    
    ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1], 10);
            
            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //2. Delete item from UI
            UICtrl.deleteListItem(itemID);
            //3. Update and show the new budget
            updateBudget();
        }
    };
    
    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                netIncome: 0,
                netExpense: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };
                              
}(budgetController, UIController));

controller.init();