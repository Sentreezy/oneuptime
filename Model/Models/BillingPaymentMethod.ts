import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import BaseModel from 'Common/Models/BaseModel';
import User from './User';
import Project from './Project';
import CrudApiEndpoint from 'Common/Types/Database/CrudApiEndpoint';
import Route from 'Common/Types/API/Route';
import TableColumnType from 'Common/Types/Database/TableColumnType';
import TableColumn from 'Common/Types/Database/TableColumn';
import ColumnType from 'Common/Types/Database/ColumnType';
import ObjectID from 'Common/Types/ObjectID';
import ColumnLength from 'Common/Types/Database/ColumnLength';
import TableAccessControl from 'Common/Types/Database/AccessControl/TableAccessControl';
import Permission from 'Common/Types/Permission';
import ColumnAccessControl from 'Common/Types/Database/AccessControl/ColumnAccessControl';
import TenantColumn from 'Common/Types/Database/TenantColumn';
import SingularPluralName from 'Common/Types/Database/SingularPluralName';
import AllowAccessIfSubscriptionIsUnpaid from 'Common/Types/Database/AccessControl/AllowAccessIfSubscriptionIsUnpaid';

@AllowAccessIfSubscriptionIsUnpaid()
@TenantColumn('projectId')
@TableAccessControl({
    create: [Permission.ProjectOwner, Permission.CanCreateBillingPaymentMethod],
    read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
    delete: [Permission.ProjectOwner, Permission.CanDeleteBillingPaymentMethod],
    update: [],
})
@CrudApiEndpoint(new Route('/billing-payment-methods'))
@SingularPluralName('Payment Method', 'Payment Methods')
@Entity({
    name: 'BillingPaymentMethod',
})
export default class BillingPaymentMethod extends BaseModel {
    @ColumnAccessControl({
        create: [
            Permission.ProjectOwner,
            Permission.CanCreateBillingPaymentMethod,
        ],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({
        manyToOneRelationColumn: 'projectId',
        type: TableColumnType.Entity,
        modelType: Project,
    })
    @ManyToOne(
        (_type: string) => {
            return Project;
        },
        {
            eager: false,
            nullable: true,
            onDelete: 'CASCADE',
            orphanedRowAction: 'nullify',
        }
    )
    @JoinColumn({ name: 'projectId' })
    public project?: Project = undefined;

    @ColumnAccessControl({
        create: [
            Permission.ProjectOwner,
            Permission.CanCreateBillingPaymentMethod,
        ],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @Index()
    @TableColumn({
        type: TableColumnType.ObjectID,
        required: true,
        canReadOnPopulate: true,
    })
    @Column({
        type: ColumnType.ObjectID,
        nullable: false,
        transformer: ObjectID.getDatabaseTransformer(),
    })
    public projectId?: ObjectID = undefined;

    @ColumnAccessControl({
        create: [
            Permission.ProjectOwner,
            Permission.CanCreateBillingPaymentMethod,
        ],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({
        manyToOneRelationColumn: 'createdByUserId',
        type: TableColumnType.Entity,
        modelType: User,
    })
    @ManyToOne(
        (_type: string) => {
            return User;
        },
        {
            eager: false,
            nullable: true,
            onDelete: 'CASCADE',
            orphanedRowAction: 'nullify',
        }
    )
    @JoinColumn({ name: 'createdByUserId' })
    public createdByUser?: User = undefined;

    @ColumnAccessControl({
        create: [
            Permission.ProjectOwner,
            Permission.CanCreateBillingPaymentMethod,
        ],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({ type: TableColumnType.ObjectID })
    @Column({
        type: ColumnType.ObjectID,
        nullable: true,
        transformer: ObjectID.getDatabaseTransformer(),
    })
    public createdByUserId?: ObjectID = undefined;

    @ColumnAccessControl({
        create: [],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({
        manyToOneRelationColumn: 'deletedByUserId',
        type: TableColumnType.ObjectID,
    })
    @ManyToOne(
        (_type: string) => {
            return User;
        },
        {
            cascade: false,
            eager: false,
            nullable: true,
            onDelete: 'CASCADE',
            orphanedRowAction: 'nullify',
        }
    )
    @JoinColumn({ name: 'deletedByUserId' })
    public deletedByUser?: User = undefined;

    @ColumnAccessControl({
        create: [],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({ type: TableColumnType.ObjectID })
    @Column({
        type: ColumnType.ObjectID,
        nullable: true,
        transformer: ObjectID.getDatabaseTransformer(),
    })
    public deletedByUserId?: ObjectID = undefined;

    @ColumnAccessControl({
        create: [
            Permission.ProjectOwner,
            Permission.CanCreateBillingPaymentMethod,
        ],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({ type: TableColumnType.ShortText })
    @Column({
        type: ColumnType.ShortText,
        length: ColumnLength.ShortText,
        nullable: false,
        unique: false,
    })
    public type?: string = undefined;

    @ColumnAccessControl({
        create: [],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({ type: TableColumnType.ShortText })
    @Column({
        type: ColumnType.ShortText,
        length: ColumnLength.ShortText,
        nullable: false,
        unique: false,
    })
    public paymentProviderPaymentMethodId?: string = undefined;

    @ColumnAccessControl({
        create: [],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({ type: TableColumnType.ShortText })
    @Column({
        type: ColumnType.ShortText,
        length: ColumnLength.ShortText,
        nullable: false,
        unique: false,
    })
    public paymentProviderCustomerId?: string = undefined;

    @ColumnAccessControl({
        create: [
            Permission.ProjectOwner,
            Permission.CanCreateBillingPaymentMethod,
        ],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({ type: TableColumnType.ShortText })
    @Column({
        type: ColumnType.ShortText,
        length: ColumnLength.ShortText,
        nullable: false,
        unique: false,
    })
    public last4Digits?: string = undefined;

    @ColumnAccessControl({
        create: [
            Permission.ProjectOwner,
            Permission.CanCreateBillingPaymentMethod,
        ],
        read: [Permission.ProjectOwner, Permission.CanReadBillingPaymentMethod],
        update: [],
    })
    @TableColumn({ type: TableColumnType.Boolean })
    @Column({
        type: ColumnType.Boolean,
        nullable: true,
        unique: false,
    })
    public isDefault?: boolean = undefined;
}
