import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create.profile.dto';
import { Profile } from './profile.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Profile) private profileRepository: Repository<Profile>
    ) {}

    async createUser(user:CreateUserDto){

        const userFound = await this.usersRepository.findOne({
            where: {username: user.username}
        });

        if(userFound){
            return new HttpException('User already exists', HttpStatus.CONFLICT);
        }

        const newUser = this.usersRepository.create(user);
        return this.usersRepository.save(newUser);
    }

    getUsers(){
        return this.usersRepository.find({
            relations: ['posts', 'profile']
        });
    }

    async getUserById(id:number){
        const userFound = await this.usersRepository.findOne({
            where: {id},
            relations: ['posts']
        });

        if(!userFound){
            return new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return userFound;
    }

    async deleteUser(id:number){
       const userFound = await this.usersRepository.delete({id});

       if(userFound.affected === 0){
           return new HttpException('User not found', HttpStatus.NOT_FOUND);
       }
       return userFound;
    }

    updateUser(id: number, user: UpdateUserDto) {
        const userFound = this.usersRepository.findOne({
            where: {
                id
            }
        });

        if (!userFound) {
            return new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const updateUser = Object.assign(userFound, user);
        return this.usersRepository.save(updateUser);
    }

    async createProfile(id: number, profile: CreateProfileDto) {
      const userFound = await this.usersRepository.findOne({ where: { id } }); 

      if (!userFound) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const newProfile = this.profileRepository.create(profile);
      const saveProfile =  await this.profileRepository.save(newProfile);
      userFound.profile = saveProfile;

      return this.usersRepository.save(userFound);
}
}