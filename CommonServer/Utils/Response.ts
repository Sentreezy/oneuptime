import JsonToCsv from './JsonToCsv';
import logger from './Logger';
import {
    OneUptimeRequest,
    ExpressResponse,
    ExpressRequest,
    OneUptimeResponse,
} from './Express';
import { JSONObject, JSONArray, JSONObjectOrArray } from 'Common/Types/JSON';
import Exception from 'Common/Types/Exception/Exception';
import ListData from 'Common/Types/ListData';
import PositiveNumber from 'Common/Types/PositiveNumber';
import URL from 'Common/Types/API/URL';
import BaseModel from 'Common/Models/BaseModel';
import EmptyResponse from 'Common/Types/API/EmptyResponse';
import JSONFunctions from 'Common/Types/JSONFunctions';
import FileModel from 'Common/Models/FileModel';

export default class Response {
    private static logResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        responsebody?: JSONObjectOrArray
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        const requestEndedAt: Date = new Date();
        const method: string = oneUptimeRequest.method;
        const url: URL = URL.fromString(oneUptimeRequest.url);

        const header_info: string = `Response ID: ${
            oneUptimeRequest.id
        } -- POD NAME: ${
            process.env['POD_NAME'] || 'NONE'
        } -- METHOD: ${method} -- URL: ${url.toString()} -- DURATION: ${(
            requestEndedAt.getTime() -
            (oneUptimeRequest.requestStartedAt as Date).getTime()
        ).toString()}ms -- STATUS: ${oneUptimeResponse.statusCode}`;

        const body_info: string = `Response ID: ${
            oneUptimeRequest.id
        } -- RESPONSE BODY: ${
            responsebody ? JSON.stringify(responsebody, null, 2) : 'EMPTY'
        }`;

        if (oneUptimeResponse.statusCode > 299) {
            logger.error(header_info + '\n ' + body_info);
        } else {
            logger.info(header_info + '\n ' + body_info);
        }
    }

    public static sendEmptyResponse(
        req: ExpressRequest,
        res: ExpressResponse
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        oneUptimeResponse.set(
            'ExpressRequest-Id',
            oneUptimeRequest.id.toString()
        );
        oneUptimeResponse.set('Pod-Id', process.env['POD_NAME']);

        oneUptimeResponse.status(200).send({} as EmptyResponse);

        return this.logResponse(req, res, undefined);
    }

    public static async sendFileResponse(
        req: ExpressRequest | ExpressRequest,
        res: ExpressResponse,
        file: FileModel
    ): Promise<void> {
        /** Create read stream */

        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        /** Set the proper content type */
        oneUptimeResponse.set('Content-Type', file.type);
        oneUptimeResponse.status(200);
        /** Return response */
        // readstream.pipe(res);

        oneUptimeResponse.send(file.file);

        this.logResponse(req, res);
    }

    public static sendErrorResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        error: Exception
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        oneUptimeResponse.logBody = { message: error.message }; // To be used in 'auditLog' middleware to log reponse data;
        const status: number = error.code || 500;
        const message: string = error.message || 'Server Error';

        logger.error(error);

        oneUptimeResponse.set(
            'ExpressRequest-Id',
            oneUptimeRequest.id.toString()
        );
        oneUptimeResponse.set('Pod-Id', process.env['POD_NAME']);

        oneUptimeResponse.status(status).send({ message });
        return this.logResponse(req, res, { message });
    }

    public static sendEntityArrayResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        list: Array<BaseModel>,
        count: PositiveNumber,
        modelType: { new (): BaseModel }
    ): void {
        return this.sendJsonArrayResponse(
            req,
            res,
            JSONFunctions.serializeArray(
                JSONFunctions.toJSONArray(list as Array<BaseModel>, modelType)
            ),
            count
        );
    }

    public static sendEntityResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        item: BaseModel | null,
        modelType: { new (): BaseModel }
    ): void {
        return this.sendJsonObjectResponse(
            req,
            res,
            item
                ? JSONFunctions.serialize(
                      JSONFunctions.toJSONObject(item, modelType)
                  )
                : {}
        );
    }

    public static sendJsonArrayResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        list: Array<JSONObject>,
        count: PositiveNumber
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        oneUptimeResponse.set(
            'ExpressRequest-Id',
            oneUptimeRequest.id.toString()
        );
        oneUptimeResponse.set('Pod-Id', process.env['POD_NAME']);

        const listData: ListData = new ListData({
            data: [],
            count: new PositiveNumber(0),
            skip: new PositiveNumber(0),
            limit: new PositiveNumber(0),
        });

        if (!list) {
            list = [];
        }

        listData.data = list as JSONArray;

        if (count) {
            listData.count = count;
        } else if (list) {
            listData.count = new PositiveNumber(list.length);
        }

        if (oneUptimeRequest.query['skip']) {
            listData.skip = new PositiveNumber(
                parseInt(oneUptimeRequest.query['skip'].toString())
            );
        }

        if (oneUptimeRequest.query['limit']) {
            listData.limit = new PositiveNumber(
                parseInt(oneUptimeRequest.query['limit'].toString())
            );
        }

        if (oneUptimeRequest.query['output-type'] === 'csv') {
            const csv: string = JsonToCsv.ToCsv(listData.data);
            oneUptimeResponse.status(200).send(csv);
        } else {
            oneUptimeResponse.status(200).send(listData);
            oneUptimeResponse.logBody = listData.toJSON(); // To be used in 'auditLog' middleware to log reponse data;
            this.logResponse(req, res, listData.toJSON());
        }
    }

    public static sendJsonObjectResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        item: JSONObject
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        oneUptimeResponse.set(
            'ExpressRequest-Id',
            oneUptimeRequest.id.toString()
        );

        oneUptimeResponse.set('Pod-Id', process.env['POD_NAME']);

        if (oneUptimeRequest.query['output-type'] === 'csv') {
            const csv: string = JsonToCsv.ToCsv([item as JSONObject]);
            oneUptimeResponse.status(200).send(csv);
            this.logResponse(req, res);
            return;
        }

        oneUptimeResponse.logBody = item as JSONObject;
        oneUptimeResponse.status(200).send(item);
        this.logResponse(req, res, item as JSONObject);
    }

    public static sendTextResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        text: string
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        oneUptimeResponse.set(
            'ExpressRequest-Id',
            oneUptimeRequest.id.toString()
        );

        oneUptimeResponse.set('Pod-Id', process.env['POD_NAME']);

        oneUptimeResponse.logBody = { text: text as string };
        oneUptimeResponse.status(200).send(text);
        this.logResponse(req, res, { text: text as string });
    }

    public static sendHtmlResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        html: string
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        oneUptimeResponse.set(
            'ExpressRequest-Id',
            oneUptimeRequest.id.toString()
        );

        oneUptimeResponse.set('Pod-Id', process.env['POD_NAME']);

        oneUptimeResponse.logBody = { html: html as string };
        oneUptimeResponse.writeHead(200, { 'Content-Type': 'text/html' });
        oneUptimeResponse.end(html);
        this.logResponse(req, res, { html: html as string });
    }

    public static sendJavaScriptResponse(
        req: ExpressRequest,
        res: ExpressResponse,
        javascript: string
    ): void {
        const oneUptimeRequest: OneUptimeRequest = req as OneUptimeRequest;
        const oneUptimeResponse: OneUptimeResponse = res as OneUptimeResponse;

        oneUptimeResponse.set(
            'ExpressRequest-Id',
            oneUptimeRequest.id.toString()
        );

        oneUptimeResponse.set('Pod-Id', process.env['POD_NAME']);

        oneUptimeResponse.logBody = { javascript: javascript as string };
        oneUptimeResponse.writeHead(200, { 'Content-Type': 'text/javascript' });
        oneUptimeResponse.end(javascript);
        this.logResponse(req, res, { javascript: javascript as string });
    }
}
