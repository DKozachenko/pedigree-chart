# pedigree-chart

Приложение для просмотра диаграммы родословной.

## Стек

* Vite
* Typescript
* React
* GoJS

## Модель

В качестве модели выступает интерфейс `IRelative` со следуюшими полями:

* `key` - уникальный идентификатор, исторически лучше указывать положительное целое число **(обязательное)**.
* `name` - имя **(обязательное)**.
* `lastName` - фамилия **(обязательное)**.
* `middleName` - отчество *(необязательное)*.
* `gender` - пол, `F` или `M` **(обязательное)**.
* `parents` - родители, массив из одного или двух идентификаторов *(необязательное)*.

Данные должны находиться по пути `./src/app/store/slices/relatives/default-data.ts`;

Из него должна экспортироваться константа `DEFAULT_DATA`, которая представляет собой массив `IRelative`.

## Запуск в режиме разработки

```bash
npm i  
npm run start
```

## Сборка

```bash
npm i  
npm run build
```

## Запуск в Docker контейнере

```bash
docker build . -t pedigree-chart-image  -f  Dockerfile.local  
docker run -d -p 5173:80 pedigree-chart-image:latest
```

Приложение можно просмотреть по адресу `http://localhost:5173`.