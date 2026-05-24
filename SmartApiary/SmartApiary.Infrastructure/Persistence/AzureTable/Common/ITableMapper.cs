using Azure.Data.Tables;

namespace SmartApiary.Infrastructure.Persistence.AzureTable.Common
{
    internal interface ITableMapper<TDomain, TEntity>
            where TEntity : class, ITableEntity, new()
    {
        TEntity ToEntity(TDomain domain);
        TDomain? ToDomain(TEntity entity);
    }
}
