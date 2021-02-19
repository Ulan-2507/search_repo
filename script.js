
class View {
    constructor(api) {
        this.api = api;

        this.app = document.getElementById('app');

        // Список 
        this.selectedListWrapper = this.createElement('div', 'selectedListWrapper');
        this.selectedReposList = this.createElement('ul', 'selectedReposList');
        this.selectedListWrapper.append(this.selectedReposList);

        // Поле поиска
        this.searchLine = this.createElement('div', 'search-line');
        this.searchInput = this.createElement('input', 'search-input');
        this.searchLine.append(this.searchInput);
        
        // Поля автодополнения 
        this.searchList = this.createElement('ul', 'search-list');
        this.searchLine.append(this.searchList);

        //Добавление всех блоков в приложение
        this.app.append(this.searchLine);
        this.app.append(this.selectedListWrapper);
        
        this.arrRepos = {};
    }

    // Функция для создания элемента
    createElement(elementName, className) {
        const element = document.createElement(elementName);
        if (className) {
            element.classList.add(className)
        }
        return element;
    }

    
}

class Search {

    constructor(view) {
        this.view = view;
        this.view.searchInput.addEventListener('keyup', this.debounce(this.searchRepos.bind(this), 500));
        this.view.searchList.addEventListener('click', this.addItem.bind(this));
        this.view.selectedReposList.addEventListener('click', this.deletItem.bind(this));
    }

    // Выполняем поиск пользователей при каждом вводе символа в поисковую строку
    async searchRepos() {
        if (this.view.searchInput.value) {
            return await fetch(`https://api.github.com/search/repositories?q=${this.view.searchInput.value}&per_page=${5}`)
                .then(response => this.reposArr = response.json())
                .then(result => this.autoComplite(result.items))
        } else {
            this.clearSearchList();
        }
    }

    // Список сходных запросов
    autoComplite(repos) {
        this.clearSearchList();
        this.view.arrRepos = {};
        let fragment = new DocumentFragment();
        for (let repo of repos) {
            this.view.searchlistItem = this.view.createElement('li', 'searchlistItem');
            this.view.searchlistItem.innerHTML = repo.name;
            this.view.searchlistItem.dataset.name = repo.name;
            this.view.arrRepos[repo.name] = repo;
            fragment.append(this.view.searchlistItem);
        }
        this.view.searchList.append(fragment);
    }
    // Очистка списка сходных запросов
    clearSearchList() {
        this.view.searchList.innerHTML = '';
    }
    
    // Добавление в список 
    addItem(e) {
        let targetItem = e.target;
        let targetRepo = this.view.arrRepos[targetItem.dataset.name];
              
        this.view.selectedItem = this.view.createElement('li', 'selectedItem');
        this.view.selectedItemContent = this.view.createElement('li', 'selectedItemContent');
        this.view.deletBtn = this.view.createElement('button', 'deletBtn');
        this.view.selectedItemContent.innerHTML = `<ul>
                                                        <li>Name: ${targetRepo.name}</li>
                                                        <li>Owner: ${targetRepo.owner.login}</li>
                                                        <li>Stars: ${targetRepo.stargazers_count}</li>
                                                    </ul>`;
        this.view.selectedItem.append(this.view.selectedItemContent);
        this.view.selectedItem.append(this.view.deletBtn);
        this.view.selectedReposList.append(this.view.selectedItem);
      
    }
    // Удаление из списка
    deletItem(e) {
        if(e.target.tagName != 'BUTTON'){
            return ;
        }
        e.target.closest('li').remove();
    }

    // Задержка ввода данных для отправки запроса
    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
      
}

new Search(new View);