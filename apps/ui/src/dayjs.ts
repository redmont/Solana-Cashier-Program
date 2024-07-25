'use client';

import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';

dayjs.extend(durationPlugin);
dayjs.extend(utc);
