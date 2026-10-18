# Manchester Triage

Preciso de um app de triagem hospitalar feito em react, com um sistema de banco de dados imbutido, utilizando de um id único para cada paciente cadastrado.
Ao chegar um paciente, ele deve ter esse id único, o tempo de chegada. Também deve ser possível inserir nível crítico do paciente seguindo o sistema de cores do protocolo manchester e no caso de ter sido marcado com a cor amarela que indica uma gravidade moderada, deve ter uma caixa de texto para que possa inserir detalhes sobre o que o paciente está sofrendo.
Também deve seguir os padrões de tempo de cada cor do protocolo manchester para que caso uma cor laranja (que tem menor prioridade em comparação com a vermelha), possa se tornar vermelha caso o tempo limite de 10 minutos tenha passado. Entre vários pacientes de cores iguais, quem tiver chegado primeiro deve ser atendido primeiro.
Com dashboard inicial
Página de cadastro
Página de login
Registro dos pacientes, onde pode-se filtrar os dados do paciente, para que atendentes ou médicos possam buscá-los.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9fe2281e-2152-4ee2-a1b9-4a10655da04f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
