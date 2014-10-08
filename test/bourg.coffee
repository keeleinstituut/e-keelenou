class Bourgeoisie
  constructor: (@age, @privilegeConstant) ->
 
  worry: ->
    console.log("My stocks are down 1%!")
 
  profit: (hardWork, luck) ->
    return (@age - 23) * hardWork * (luck + @privilegeConstant)
 


class Senator extends Bourgeoisie
  worry: ->
    console.log("The polls are down 1%!")


class Student extends Bourgeoisie
  worry: ->
    console.log("Does my privilege inherently make me complicit in the repression of less fortunate classes?")
 
  profit: (hardWork, luck, tuition) ->
    super(hardWork, luck) - tuition
 


student = new Student(21, 89)
student.worry() #"Does my privilege inherently make me complicit in the repression of less fortunate classes?"
student.profit(10, 10, 10000) #-11980



elite = new Bourgeoisie(29, 397)
elite.worry() # "My stocks are down 1%!"
elite.profit(20, 50) #53640


 
senator = new Senator(45, 992)
senator.worry() # "The polls are down 1%!")
senator.profit(6, 10) # 132264