 const express = require('express')
 const app  = express();
const { v4:uuidv4 } = require('uuid')
 app.use(express.json())

 
 const customers =[];
function validCPF(req, res, next){
    const { cpf } = req.headers;
    const vCustomer = customers.find((customer)=> customer.cpf === cpf)

    if(!vCustomer){return res.status(400).json({error:"Usuário ainda não cadastrado!"})}

    req.customer = vCustomer;

    return next();
}
function getBalance(statement){
    const Balance = statement.reduce((acc, operator)=>{
        if(operator.type === "Credito"){
            return acc + operator.amount
        }else{
            return acc - operator.amount;
        }
    }, 0)
    return Balance;
}
 app.post("/account", (req,res)=>{
     const { nome, cpf } = req.body;

     const allreadyExists = customers.some((customer) => customer.cpf === cpf)
     if(allreadyExists){
         return res.status(400).json({error:"Usuário já existe!"})
     }

     customers.push({
         nome, cpf, id:uuidv4(), statement:[],
     })

     return res.status(201).json({message:"dados cadastrados com sucesso!"})
 })

 app.get("/statement",validCPF, (req, res)=>{
     const { customer } = req;
 
     return res.json(customer.statement)
 })

app.post("/deposit", validCPF, (req, res)=>{
    const { amount, description } = req.body;
    const { customer } = req;

    const statementOperation ={
        amount, type:"Credito", description, created_at: new Date(),
    }

    customer.statement.push(statementOperation)
    return res.status(201).json({message:`Deposito de R$${amount} realizado com sucesso!`})
})

app.post("/withdraw", validCPF, (req, res)=>{
    const { amount } = req.body;
    const { customer } = req
    const balance = getBalance(customer.statement)
 
    if(balance < amount){
        return res.json({message:`Saldo é insuficiente`})
    }
const operator = {
    amount, type:"Debito", created_at:new Date(),
}
customer.statement.push(operator)
return res.status(201).json({message:`Saque realizado de R$ ${amount}. seu saldo é de R$ ${balance-amount}`})
})
 
app.get("/queryDate", validCPF,(req, res)=>{
    const { customer }= req;
    const { date } = req.query;

    const dataf = new Date(date + " 00:00")
    const resfilter = customer.statement.filter((id) => id.created_at.toDateString() ===
    new Date(dataf).toDateString())

    return res.json(resfilter)
})


app.put("/update_account", validCPF,(req, res)=>{
    const { customer } = req;
    const { nome, cpf } = req.body;

    customer.nome = nome;
    customer.cpf  = cpf;

    return res.status(201).json(customer)

})

app.get("/account_perfil", validCPF, (req, res)=>{
    const { customer } = req;
    return res.json(customer)
})

app.delete("/account_delete", validCPF, (req, res)=>{
    const { customer } = req;
    customers.splice(customer, 1)
    return res.json(customers)
})


app.listen(3333, ()=>{
    console.log('server online')
})