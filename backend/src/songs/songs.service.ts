import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Band } from './bands.entity';
import { Repository } from 'typeorm';
import { Song } from './songs.entity';
import { AddSongDto } from './dto/add-song.dto';

@Injectable({})
export class SongsService {
  constructor(
    @InjectRepository(Band)
    private bandRepository: Repository<Band>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
  ) {}

  async addBand(addSongDto: AddSongDto) {
    const { bandName } = addSongDto;

    const existingBand = await this.bandRepository.findOneBy({ bandName });
    if (existingBand) {
      return existingBand.id;
    }

    const newBand = this.bandRepository.create({ bandName });
    const { id } = await this.bandRepository.save(newBand);
    return id;
  }

  async addSong(addSongDto: AddSongDto, bandId: number) {
    try {
      // TypeORM Direct Assignment Not Recommended need to fetch from DB first
      const band = await this.bandRepository.findOneBy({ id: bandId });
      if (!band) {
        throw new NotFoundException('Band not found');
      }

      const { songName, year } = addSongDto;

      const newSong = this.songRepository.create({
        name: songName,
        year: year,
        band: band,
      });

      const res = await this.songRepository.save(newSong);

      return res;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to add the song due to an unexpected error. Please try again later.',
      );
    }
  }

  // get all songs
  async getAllSongs(): Promise<Song[]> {
    try {
      return await this.songRepository.find({
        relations: {
          band: true,
        },
        order: {
          band: {
            bandName: 'ASC',
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch songs');
    }
  }
}
